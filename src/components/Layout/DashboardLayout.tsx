import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  FilterList,
  TableChart,
  Settings,
  CloudUpload,
} from "@mui/icons-material";
import * as XLSX from "xlsx";

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// NOTE: Parsing will be handled by a Python/pandas backend. Frontend uploads files to that endpoint.

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImporting(true);

    const form = new FormData();
    const parsedResults: Array<any> = [];
    const uploadFiles: File[] = [];

    const isExcel = (name: string) => /\.(xlsx|xls|xlsm|csv)$/i.test(name);

    const readExcel = (file: File) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) return resolve(null);
            const wb = XLSX.read(data as ArrayBuffer, { type: "array" });
            const sheets: Record<string, any[]> = {};
            wb.SheetNames.forEach((sheetName) => {
              const ws = wb.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(ws, { defval: null });
              sheets[sheetName] = json;
            });
            resolve({ fileName: file.name, sheets });
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      });

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (isExcel(f.name)) {
        try {
          const parsed = await readExcel(f);
          if (parsed) parsedResults.push(parsed);
        } catch (err) {
          console.error("Error parsing", f.name, err);
          alert(`Erro ao parsear ${f.name}. Veja console para detalhes.`);
        }
      } else {
        uploadFiles.push(f);
        form.append("files", f);
      }
    }

    try {
      // If there are non-excel files, send them to the backend as before
      if (uploadFiles.length > 0) {
        const resp = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Upload failed");
        }

        const results = await resp.json();
        console.log("Server parsed results:", results);
      }

      if (parsedResults.length > 0) {
        console.log("Client parsed results:", parsedResults);
        // You can now send `parsedResults` to your backend as JSON
        // or store it in state and use it directly in the app.
        alert(
          `Importado ${parsedResults.length} documento(s) (Excel). Veja console para detalhes.`
        );
      } else if (uploadFiles.length > 0) {
        alert("Arquivos enviados ao servidor. Veja console para detalhes.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao importar arquivos. Verifique o console.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, active: true },
    { text: "Avaliações", icon: <Assessment />, active: false },
    { text: "Filtros", icon: <FilterList />, active: false },
    { text: "Relatórios", icon: <TableChart />, active: false },
    { text: "Configurações", icon: <Settings />, active: false },
  ];

  const drawer = (
    <div className="h-full bg-card flex flex-col">
      <div className="p-6 bg-primary">
        <Typography variant="h6" className="text-primary-foreground font-bold">
          Avaliação Institucional
        </Typography>
      </div>
      <Divider />
      <List className="flex-1 p-3">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className="mb-1">
            <ListItemButton
              className={`rounded-lg transition-all ${
                item.active
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <ListItemIcon
                className={
                  item.active ? "text-primary-foreground" : "text-foreground"
                }
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box className="flex h-screen bg-background">
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: "hsl(var(--border))",
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
        }}
      >
        <Toolbar className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Dashboard de Avaliação
            </Typography>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              color="inherit"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importando..." : "Importar"}
            </Button>

            {/* Novo: botão para página de login */}
            <Button
              color="inherit"
              onClick={() => navigate("/login")}
              sx={{ ml: 1 }}
            >
              Entrar
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              borderRight: 1,
              borderColor: "hsl(var(--border))",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

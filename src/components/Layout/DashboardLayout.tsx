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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageType, setPageType] = useState("cursos");
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPendingFiles(files);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPageName("");
    setPageType("cursos");
    setPendingFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModalConfirm = async () => {
    if (!pageName.trim()) {
      alert("Por favor, insira o nome da página.");
      return;
    }

    setModalOpen(false);
    await handleFiles(pendingFiles, pageName.toLowerCase().trim(), pageType);
    setPageName("");
    setPageType("cursos");
    setPendingFiles(null);
  };

  const handleFiles = async (
    files: FileList | null,
    pageNameLower: string,
    pageType: string
  ) => {
    if (!files || files.length === 0) return;

    setImporting(true);

    try {
      // Envia cada arquivo individualmente para o backend
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();

        form.append("file", file);
        form.append("pageName", pageNameLower);
        form.append("type", pageType);

        const resp = await fetch("http://localhost:5000/import_file", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(
            `Erro ao enviar ${file.name}: ${text || "Upload failed"}`
          );
        }

        const result = await resp.json();
      }

      alert(
        `${files.length} arquivo(s) importado(s) com sucesso para "${pageNameLower}" (tipo: ${pageType}).`
      );
    } catch (err) {
      console.error(err);
      alert(
        `Erro ao importar arquivos: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      active: true,
    },
    {
      text: "Avaliações",
      icon: <Assessment onClick={() => navigate("/")} />,
      active: false,
    },
    {
      text: "Filtros",
      icon: <FilterList onClick={() => navigate("/")} />,
      active: false,
    },
    {
      text: "Relatórios",
      icon: <TableChart onClick={() => navigate("/")} />,
      active: false,
    },
    {
      text: "Configurações",
      icon: <Settings onClick={() => navigate("/")} />,
      active: false,
    },
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
              onClick={() => navigate("/")}
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
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <Button
              color="inherit"
              startIcon={<CloudUpload />}
              onClick={handleImportClick}
              disabled={importing}
            >
              {importing ? "Importando..." : "Importar"}
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ ml: 1 }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/login")}
              sx={{ ml: 1 }}
            >
              Entrar
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/avancado")}
              sx={{ ml: 1 }}
            >
              Comparação Avançada
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate("/professor")}
              sx={{ ml: 1 }}
            >
              Professor
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      {/* Modal para nome da página */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configuração da Importação</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Digite o nome da página"
            type="text"
            fullWidth
            variant="outlined"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleModalConfirm();
              }
            }}
            helperText="O nome será convertido para minúsculas automaticamente"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth variant="outlined">
            <InputLabel id="page-type-label">Tipo</InputLabel>
            <Select
              labelId="page-type-label"
              id="page-type-select"
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="cursos">Curso</MenuItem>
              <MenuItem value="disciplina_ead">Disciplina Ead</MenuItem>
              <MenuItem value="disciplina_presencial">
                Disciplina presencial
              </MenuItem>
              <MenuItem value="institucional">Institucional</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancelar</Button>
          <Button onClick={handleModalConfirm} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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

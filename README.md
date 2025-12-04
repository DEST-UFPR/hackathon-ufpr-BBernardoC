# 📊 Hackathon
Um dashboard interativo para análise e visualização de dados de pesquisas acadêmicas, com suporte a múltiplas categorias de dados (disciplinas presenciais, EAD, cursos e institucional).

## Site disponivel em:

https://insight-hackathon-ufpr.vercel.app/

## 🚀 Como Começar

### Instalação

#### 1. Clone o repositório

```bash
git clone https://github.com/DEST-UFPR/hackathon-ufpr-BBernardoC.git
```

#### 2. Instale as dependências do frontend

```bash
# Usando npm
npm install

# Ou usando bun
bun install
```

#### 3. Configure o backend

```bash
# Entre na pasta do servidor
cd server


# Instale as dependências
pip install -r requirements.txt
```

### Desenvolvimento

#### Terminal 1: Frontend (Vite)

```bash
npm run dev
# ou
bun run dev
```

#### Terminal 2: Backend (Flask)

```bash
cd server

# Ative o ambiente virtual
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Execute a API
python api.py
```

## 🔐 Autenticação

O projeto inclui um sistema de autenticação com:

- _No link do site esta setado como default admin (servidor de backend não esta online)_
- Página de Login
- Página de Registro
- Contexto de Autenticação (AuthContext)
- Proteção de rotas

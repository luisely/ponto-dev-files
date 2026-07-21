# Sistema de Ponto Eletrônico

Sistema web para registro de pontos com autenticação Google e armazenamento em Supabase.

## 🚀 Tecnologias

- **Frontend**: TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Autenticação**: Google OAuth via Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie `.env.example` para `.env`
2. Preencha com suas credenciais do Supabase
3. Configure a autenticação Google no Supabase

Veja instruções detalhadas em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📐 Estrutura

```
src/
├── lib/
│   └── supabase.ts          # Cliente Supabase + Types
├── services/
│   ├── AuthService.ts       # Autenticação Google
│   └── BatidaServices.ts    # CRUD de pontos
├── controllers/
│   ├── AppController.ts     # Inicialização
│   ├── PointsController.ts  # Lógica de pontos
│   └── UIController.ts      # Controle de UI
└── ...
```

## 🔒 Segurança

- Row Level Security (RLS) habilitado
- Cada usuário acessa apenas seus próprios dados
- Autenticação via OAuth 2.0 (Google)

## 📄 Licença

ISC


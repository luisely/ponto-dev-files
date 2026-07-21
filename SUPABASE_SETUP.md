# 🚀 Configuração do Supabase

## 📋 Passo a Passo

### 1️⃣ Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
3. Vá em **Settings** → **API**
4. Copie as credenciais:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

Exemplo do arquivo `.env`:
```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2️⃣ Configurar Autenticação Google

1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Encontre **Google** e clique em **Enable**
3. Você precisará criar credenciais OAuth no Google Cloud:

#### Google Cloud Console:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Configure a tela de consentimento se solicitado
6. Tipo de aplicação: **Web application**
7. Adicione as URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:5173` (dev) e sua URL de produção
   - **Authorized redirect URIs**: 
     - `https://SEU-PROJETO.supabase.co/auth/v1/callback`
     - `http://localhost:5173` (dev)
8. Copie o **Client ID** e **Client Secret**

#### De volta ao Supabase:
1. Cole o **Client ID** e **Client Secret** no provider Google
2. Clique em **Save**

---

### 3️⃣ Configurar Tabelas (SQL já executado)

✅ Se você já executou o SQL que forneci, pule esta etapa.

Caso contrário, execute no **SQL Editor** do Supabase:

```sql
-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Users can view own profile" 
  ON public.usuarios FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.usuarios FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.usuarios FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para PONTOS
CREATE POLICY "Users can view own pontos" 
  ON public.pontos FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own pontos" 
  ON public.pontos FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own pontos" 
  ON public.pontos FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pontos_usuario_data 
  ON public.pontos(usuario_id, data DESC);

-- Constraint
ALTER TABLE public.pontos 
  ADD CONSTRAINT unique_usuario_data_hora 
  UNIQUE(usuario_id, data, hora);
```

---

### 4️⃣ Instalar Dependências

```bash
npm install
```

---

### 5️⃣ Rodar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## ✅ Testar

1. Clique em **"Entrar com Google"**
2. Faça login com sua conta Google
3. Registre um ponto
4. Verifique se aparece na lista
5. Teste exclusão de ponto
6. Teste logout

---

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Cada usuário só acessa seus próprios dados
- ✅ Autenticação via Google OAuth
- ✅ Chaves de API são públicas (`anon key`), mas protegidas por RLS

---

## 📊 Estrutura de Dados

### Tabela: `usuarios`
- `id` (UUID) - Referência ao `auth.users`
- `nome` (TEXT) - Nome do usuário
- `created_at` (TIMESTAMP)

### Tabela: `pontos`
- `id` (UUID) - Primary key
- `usuario_id` (UUID) - FK para `usuarios.id`
- `data` (DATE) - Data do registro
- `hora` (TIME) - Hora do registro
- `created_at` (TIMESTAMP)

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe e está preenchido
- Reinicie o servidor de desenvolvimento

### Erro ao fazer login com Google
- Verifique se o provider Google está habilitado no Supabase
- Confirme se as URLs de redirect estão corretas no Google Cloud Console

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS estão criadas corretamente
- Execute novamente o SQL de configuração

### Pontos não aparecem
- Abra o DevTools (F12) e verifique o Console
- Verifique se o usuário foi criado na tabela `usuarios`
- Confirme se as políticas RLS permitem SELECT

---

## 📝 Notas

- O primeiro login cria automaticamente o usuário na tabela `usuarios`
- Cache local continua funcionando para melhor performance
- Formato de data convertido automaticamente (BR ↔ ISO)

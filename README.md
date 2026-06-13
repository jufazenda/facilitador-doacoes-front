# Facilitador de Doações — Frontend

Aplicação web (React + Vite) que conecta doadores e instituições para campanhas e doações, com painel administrativo de aprovação de instituições.

## Stack principal

- React 19 + React Router 7
- Vite 8
- Tailwind CSS 4
- Auth0 (autenticação via `@auth0/auth0-react`)
- Axios (chamadas HTTP)
- Tabler Icons

## Estrutura resumida

```
src/
  pages/        páginas/rotas (Home, Campaigns, DonorArea, InstitutionArea, AdminArea, etc.)
  components/   componentes de UI compartilhados (Badge, FormField, Toast, TabBar, ...)
  layouts/      layout principal (MainLayout, Header, Footer)
  context/      AuthContext (mapeia usuário Auth0 para tipo de acesso)
  hooks/        useAuth, useApiClient (axios com Bearer token), useToast
  services/     funções de integração com a API (api.js, institutions.js, campaigns.js, etc.)
  utils/        helpers (máscaras, strings, dados estáticos, status labels)
```

## Principais rotas e níveis de acesso

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | público | Home |
| `/campanhas` | público | listagem de campanhas |
| `/campanha/:id` | público | detalhe de campanha |
| `/instituicoes` | público | listagem de instituições |
| `/instituicao/:id` | público | detalhe de instituição |
| `/doacao/:campanhaId` | autenticado, exceto instituições | fluxo de doação |
| `/login` | público | login (Auth0) |
| `/completar-cadastro` | autenticado sem tipo definido | completar cadastro/role |
| `/area/doador` | tipo `doador` | área do doador |
| `/area/instituicao` | tipo `instituicao` | área da instituição |
| `/area/admin` | tipo `admin` | painel administrativo |

O tipo de usuário (`doador`, `instituicao`, `admin`) vem da claim Auth0 configurada em `VITE_AUTH0_ROLE_CLAIM` (`AuthContext.jsx`). Rotas protegidas usam `ProtectedRoute`, que redireciona para `/login` ou `/` caso o usuário não tenha o tipo exigido.

## Padrão de integração com a API

- `src/services/api.js`: instância axios padrão, usada em endpoints **públicos** (`baseURL = VITE_API_URL`).
- `src/hooks/useApiClient.js`: instância axios com interceptor que injeta `Authorization: Bearer <token>` (token obtido via Auth0), usada em endpoints **protegidos**.
- Funções de serviço (`src/services/*.js`) encapsulam cada endpoint da API, retornando `response.data`.
- Todas as rotas da API seguem o prefixo `/api/v1`.

## Execução local

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run lint     # eslint
npm run preview  # preview do build
```

Requer Node >= 22.

## Variáveis de ambiente

Definidas em `.env` (ver `.env.example`):

| Variável | Descrição |
|---|---|
| `VITE_AUTH0_DOMAIN` | domínio do tenant Auth0 (igual ao backend) |
| `VITE_AUTH0_CLIENT_ID` | client ID da aplicação SPA no Auth0 |
| `VITE_AUTH0_AUDIENCE` | audience da API (igual ao backend) |
| `VITE_AUTH0_ROLE_CLAIM` | nome da claim que carrega o tipo de usuário (`donor`/`institution`/`admin`) |
| `VITE_API_URL` | URL base da API backend (ex.: `http://localhost:8080`) |

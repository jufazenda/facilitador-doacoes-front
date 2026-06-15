# Faz a Boa — Frontend

Interface web da plataforma Faz a Boa, que conecta doadores a instituições sociais verificadas. Doadores encontram campanhas ativas, acompanham o destino de suas doações e acumulam pontos em um sistema de ranking. Instituições gerenciam seus perfis, campanhas e necessidades por um painel dedicado. Um painel administrativo permite aprovar ou rejeitar cadastros de novas instituições.

O backend dessa aplicação está disponível em: [facilitador-de-doacoes](https://github.com/janinersevero/facilitador-de-doacoes)

A aplicação está em produção na Vercel: [facilitador-doacoes-front.vercel.app](https://facilitador-doacoes-front.vercel.app/)

---

## Tecnologias

| Camada       | Tecnologia                                                          |
| ------------ | ------------------------------------------------------------------- |
| Framework    | [React 19](https://react.dev/)                                      |
| Bundler      | [Vite 8](https://vite.dev/)                                         |
| Roteamento   | [React Router v7](https://reactrouter.com/)                         |
| Estilo       | [Tailwind CSS v4](https://tailwindcss.com/)                         |
| Autenticação | [Auth0 (auth0-react)](https://auth0.com/docs/libraries/auth0-react) |
| HTTP         | [Axios](https://axios-http.com/)                                    |
| Ícones       | [Lucide React](https://lucide.dev/)                                 |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22 (versão exata em `.nvmrc`: `24`)
- [npm](https://docs.npmjs.com/) >= 10 (incluído no Node.js)
- Uma conta e tenant configurados no [Auth0](https://auth0.com/) (gratuito para desenvolvimento)
- O backend rodando localmente ou acessível via URL

Se você usa [nvm](https://github.com/nvm-sh/nvm), basta rodar `nvm use` na raiz do projeto para selecionar a versão correta do Node.

---

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável                | Descrição                                                             | Exemplo                                  |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `VITE_AUTH0_DOMAIN`     | Domínio do tenant Auth0                                               | `meu-tenant.us.auth0.com`                |
| `VITE_AUTH0_CLIENT_ID`  | Client ID da aplicação SPA criada no Auth0                            | `abc123xyz`                              |
| `VITE_AUTH0_AUDIENCE`   | Identificador da API registrada no Auth0                              | `https://api.facilitador-de-doacoes.com` |
| `VITE_AUTH0_ROLE_CLAIM` | Namespace do custom claim que carrega o papel do usuário no token JWT | `https://fazaboa.com/tipo`               |
| `VITE_API_URL`          | URL base do backend                                                   | `http://localhost:8080`                  |

> As variáveis `VITE_AUTH0_*` precisam corresponder exatamente às configuradas no backend para que a autenticação funcione de ponta a ponta.

---

## Como rodar

### Instalar dependências

```bash
# via script
npm install

# equivalente direto
npx npm install --legacy-peer-deps
```

> O flag `--legacy-peer-deps` pode ser necessário em alguns ambientes (é o padrão configurado no `vercel.json`). Se `npm install` sem flag funcionar, não há problema em omiti-lo.

### Servidor de desenvolvimento

```bash
# via script
npm run dev

# equivalente direto
npx vite
```

A aplicação abre em `http://localhost:5173` por padrão. O Vite já configura um proxy de `/api` apontando para o backend em produção (`https://api.redesalves.com.br`). Para apontar para um backend local, defina `VITE_API_URL` no `.env`.

### Build de produção

```bash
# via script
npm run build

# equivalente direto
npx vite build
```

Os arquivos gerados ficam em `dist/`.

### Visualizar o build localmente

```bash
# via script
npm run preview

# equivalente direto
npx vite preview
```

### Lint

```bash
# via script
npm run lint

# equivalente direto
npx eslint .
```

---

## Páginas e rotas

| Rota                  | Página                                                    | Acesso                         |
| --------------------- | --------------------------------------------------------- | ------------------------------ |
| `/`                   | Home                                                      | Público                        |
| `/campanhas`          | Lista de campanhas                                        | Público                        |
| `/campanha/:id`       | Detalhe de uma campanha                                   | Público                        |
| `/instituicoes`       | Lista de instituições                                     | Público                        |
| `/instituicao/:id`    | Detalhe de uma instituição                                | Público                        |
| `/sobre-nos`          | Sobre o projeto e equipe                                  | Público                        |
| `/login`              | Tela de login via Auth0                                   | Público                        |
| `/completar-cadastro` | Formulário de primeiro acesso (escolha de papel)          | Autenticado sem papel definido |
| `/doacao/:campanhaId` | Fluxo de doação para uma campanha                         | Autenticado (apenas doadores)  |
| `/area/doador`        | Painel do doador: perfil, histórico e ranking             | Autenticado como `doador`      |
| `/area/instituicao`   | Painel da instituição: dashboard, campanhas, necessidades | Autenticado como `instituicao` |
| `/area/admin`         | Painel administrativo: aprovação de instituições          | Autenticado como `admin`       |

Usuários que completam o login pela primeira vez (sem papel atribuído) são redirecionados automaticamente para `/completar-cadastro`. Instituições não têm acesso ao fluxo de doação.

---

## Estrutura de pastas

```
src/
├── assets/             Imagens estáticas e SVGs usados nos componentes
│   └── images/
│       ├── category/   Imagens das categorias de doação (alimentos, roupas, etc.)
│       └── us/         Fotos dos membros da equipe (página "Sobre nós")
├── components/
│   └── ui/             Componentes reutilizáveis de interface
│                       (CampaignCard, Header, Footer, Input, Select, Toast, Loading)
├── context/
│   └── AuthContext.jsx Contexto de autenticação: abstrai o Auth0 e expõe
│                       user, login, logout e isLoading para toda a aplicação
├── hooks/
│   └── useApiClient.js Hook que retorna uma instância do Axios já configurada
│                       com o token Bearer do usuário autenticado
├── layouts/
│   └── MainLayout.jsx  Layout principal: Header + conteúdo + Footer
├── pages/              Uma pasta por rota da aplicação
│   ├── Home.jsx
│   ├── Campaigns.jsx
│   ├── CampaignDetail.jsx
│   ├── InstitutionList.jsx
│   ├── InstitutionDetail.jsx
│   ├── Donation.jsx
│   ├── Login.jsx
│   ├── CompleteRegistration.jsx
│   ├── DonorArea.jsx
│   ├── InstitutionArea.jsx
│   ├── AdminArea.jsx
│   └── AboutUs.jsx
├── services/           Funções de acesso à API, uma por domínio
│   ├── api.js          Instância base do Axios (sem autenticação)
│   ├── campaigns.js
│   ├── donations.js
│   ├── institutions.js
│   ├── necessities.js
│   ├── ranking.js
│   └── users.js
├── utils/
│   ├── categoryImages.js  Mapeamento de slug de categoria para imagem
│   ├── mockData.js        Dados fictícios usados em partes ainda não integradas
│   └── staticData.js      Dados fixos: categorias, passos do "como funciona"
├── App.jsx             Definição de todas as rotas e guards de navegação
├── main.jsx            Ponto de entrada: monta o Auth0Provider e renderiza App
└── index.css           Estilos globais e variáveis de tema do Tailwind
```

---

## Autenticação

O fluxo usa Auth0 com redirect. Ao fazer login, o Auth0 emite um JWT cujo payload contém um custom claim com o papel do usuário (`doador`, `instituicao` ou `admin`). O frontend lê esse claim via `VITE_AUTH0_ROLE_CLAIM` e usa o papel para controlar quais rotas e funcionalidades estão disponíveis.

O token é armazenado no `localStorage` e renovado automaticamente via refresh token (`useRefreshTokens: true`). As chamadas autenticadas à API incluem o token no header `Authorization: Bearer <token>`, injetado pelo hook `useApiClient`.

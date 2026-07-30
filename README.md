# Agent Panel 1

Web console for E-Citizen agents. React 19 + Vite, plain JavaScript.

## Getting started

```bash
npm install
cp .env.example .env   # then point VITE_API_BASE_URL at your backend
npm run dev            # http://localhost:5173
```

## Scripts

| Script             | Purpose                             |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Dev server with HMR on port 5173    |
| `npm run build`    | Production bundle into `dist/`      |
| `npm run preview`  | Serve the built bundle on port 4173 |
| `npm run lint`     | ESLint over the whole project       |
| `npm run lint:fix` | ESLint with autofix                 |

## Environment

Only `VITE_`-prefixed variables reach the browser, and everything that does is
**public** — never put secrets in `.env`.

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `VITE_APP_NAME`     | Display name for the panel      |
| `VITE_API_BASE_URL` | Backend API root                |
| `VITE_API_TIMEOUT`  | Request timeout in milliseconds |

`.env` is git-ignored; `.env.example` is the tracked template — add every new
key to it.

## Layout

```
src/
├── api/         Axios instance, interceptors, endpoint map, per-resource modules
├── assets/      Images, fonts, static files imported by the bundler
├── components/  Reusable presentational components
├── constants/   Config, route paths, storage keys, enums
├── context/     React context instances and their providers
├── hooks/       Custom hooks
├── layouts/     Route-level shells that wrap an <Outlet />
├── pages/       One component per route
├── routes/      Route table and guards
├── services/    Browser/platform concerns (storage, files, notifications)
├── styles/      Global CSS and design tokens
└── utils/       Framework-agnostic helpers
```

`@` is aliased to `src/`, so `import useAuth from '@/hooks/useAuth'` works from
any depth.

## Adding a route

Routes live in [src/routes/index.jsx](src/routes/index.jsx). Register the path
in [src/constants/routes.js](src/constants/routes.js) first, then add the entry:

```jsx
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';

children: [
  { path: ROUTES.LOGIN, element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [{ index: true, element: <Dashboard /> }],
  },
  { path: '*', element: <NotFound /> },
];
```

Only a `404` catch-all ships by default — the panel has no screens yet, so `/`
renders the not-found page until you add an index route.

## Calling the API

Import the shared client; never construct a new Axios instance.

```js
import axiosClient from '@/api/axiosClient';

// Responses are already unwrapped to `response.data`.
const cases = await axiosClient.get('/cases');
```

Failures reject with a normalized object — `{ status, message, fieldErrors, isNetworkError }` —
so `toast.error(error.message)` is always safe. A `401` clears the stored
session and emits `auth:unauthorized`, which drops the app back to the login
route.

## Auth

`AuthProvider` (mounted in [src/App.jsx](src/App.jsx)) exposes `user`, `token`,
`isAuthenticated`, `login()` and `logout()` through the `useAuth()` hook. It
expects `POST /auth/login` to return `{ token, user }`; adjust
[src/api/authApi.js](src/api/authApi.js) if your backend differs.

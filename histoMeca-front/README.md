# histoMeca — Frontend

Interface web de l'application histoMeca, construite avec **React 19**, **TypeScript** et **Vite 7**.

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| [React](https://react.dev/) | 19 | Framework UI |
| TypeScript | 5.9 | Langage |
| [Vite](https://vitejs.dev/) | 7 | Bundler + dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styles utilitaires |
| [DaisyUI](https://daisyui.com/) | 5 | Composants UI (thème, modales, cards…) |
| [react-router-dom](https://reactrouter.com/) | 7 | Routing côté client |

---

## Structure

```
histoMeca-front/
├── public/
└── src/
    ├── main.tsx                # Point d'entrée React
    ├── App.tsx                 # Routeur principal (BrowserRouter + Routes)
    ├── pages/
    │   ├── LandingPage.tsx     # Page publique (non connecté)
    │   ├── LoginPage.tsx       # Page de connexion
    │   └── DashboardPage.tsx   # Dashboard (connecté) — layout sidebar + contenu
    ├── components/
    │   ├── LoginForm.tsx       # Formulaire de connexion
    │   ├── Sidebar.tsx         # Navigation latérale par véhicule
    │   └── AddVehicleModal.tsx # Modale d'ajout de véhicule
    ├── services/
    │   ├── authService.ts      # Appels API auth + gestion tokens (localStorage)
    │   └── vehicleService.ts   # Appels API véhicules (créer, lister, batch)
    └── utils/
        └── api.ts              # Client HTTP générique (apiRequest, apiGet)
```

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine de `histoMeca-front/` :

```bash
VITE_API_URL=http://localhost:3000
```

Si la variable est absente, `http://localhost:3000` est utilisé par défaut.

---

## Scripts

```bash
npm run dev     # Démarre le serveur de développement (http://localhost:5173)
npm run build   # Build de production (dist/)
npm run preview # Prévisualise le build de production
npm run lint    # Lint ESLint
```

---

## Routing

| Chemin | Composant | Accès |
|--------|-----------|-------|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public |
| `/dashboard` | `DashboardPage` | Protégé (JWT requis) |
| `*` | Redirect `/` | — |

La route `/dashboard` est protégée via `PrivateRoute` : redirige vers `/login` si aucun token n'est présent dans le `localStorage`.

---

## Pages

### LandingPage
Page d'accueil publique avec une présentation de l'application et un bouton **Se connecter** qui mène vers `/login`.

### LoginPage
Formulaire email + mot de passe. Appelle `authService.login()` et redirige vers `/dashboard` après succès. Affiche un message d'erreur en cas d'identifiants invalides.

### DashboardPage
Layout en deux colonnes :
- **Sidebar gauche** (`Sidebar`) : liste des véhicules de l'utilisateur, chaque véhicule étant un menu déroulant avec 4 onglets (Informations générales, Historique, Entretiens, Documents). Bouton **Ajouter un véhicule** épinglé en bas.
- **Zone principale** : affiche le contenu correspondant à l'onglet sélectionné, ou le tableau de bord de bienvenue si rien n'est sélectionné.

Les véhicules sont chargés depuis l'API au montage du composant via `vehicleService.getAll()`. L'ajout d'un véhicule appelle `vehicleService.create()` et insère le résultat dans la liste locale.

---

## Composants

### `Sidebar`

```tsx
<Sidebar
  vehicles={vehicles}       // Vehicle[]
  selection={selection}     // Selection | null
  onSelect={setSelection}   // (Selection) => void
  onAddVehicle={openModal}  // () => void
/>
```

Types exportés : `Vehicle` (`{ id, name, type: 'auto' | 'moto' }`), `VehicleTab`, `Selection`.

### `AddVehicleModal`

Modale contrôlée pour créer un véhicule. Champs : type, marque, modèle, année, immatriculation, VIN, carburant, couleur, kilométrage actuel, date d'achat, kilométrage à l'achat, notes.

```tsx
<AddVehicleModal
  open={modalOpen}               // boolean
  onClose={() => setOpen(false)} // () => void
  onSubmit={handleAddVehicle}    // (NewVehicleForm) => void
/>
```

Type exporté : `NewVehicleForm`.

---

## Services

### `authService`

Gère l'authentification et le stockage des tokens dans `localStorage`.

```ts
authService.login({ email, password })  // → Promise<AuthTokens>
authService.logout()                    // → Promise<void>
authService.refresh()                   // → Promise<AuthTokens>
authService.getAccessToken()            // → string | null
authService.isAuthenticated()           // → boolean
```

### `vehicleService`

Gère les appels API relatifs aux véhicules.

```ts
vehicleService.getAll()          // → Promise<VehicleDTO[]>   GET /vehicles
vehicleService.getByIds(ids)     // → Promise<VehicleDTO[]>   POST /vehicles/batch
vehicleService.create(form)      // → Promise<{ id: string }> POST /vehicles
```

Type exporté : `VehicleDTO`.

### `apiRequest` / `apiGet` (`utils/api.ts`)

Client HTTP générique utilisé par tous les services.

```ts
apiRequest<T>(path, body, accessToken?) // → Promise<T>  (POST)
apiGet<T>(path, accessToken?)           // → Promise<T>  (GET)
```

Lève une `Error` avec le message retourné par l'API en cas de réponse non-ok.

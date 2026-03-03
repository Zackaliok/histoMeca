# Architecture base de données — histoMeca (MongoDB)

## Principes de conception

| Principe | Choix |
|----------|-------|
| **Embed** | Données toujours lues ensemble, faible cardinalité |
| **Reference** | Données volumineuses, mises à jour fréquentes, requêtées indépendamment |
| **Multi-tenant** | Chaque document porte un `userId` pour l'isolation des données |

---

## Vue d'ensemble des collections

```
users
 └──< vehicles          (1 user → N véhicules)
        └──< history    (1 véhicule → N entrées d'historique)
        └──< maintenancePlans  (1 véhicule → N maintenances planifiées)
```

---

## Collections

### `users`

Stocke les informations d'authentification et le profil utilisateur.

```json
{
  "_id": "ObjectId",
  "email": "john@example.com",
  "passwordHash": "$2b$10$...",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://..."
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `email` | String | Unique, indexé |
| `passwordHash` | String | Hash bcrypt, jamais le mot de passe en clair |
| `profile` | Object | Données affichage, embarquées (lues à chaque session) |

**Index :**
```js
db.users.createIndex({ email: 1 }, { unique: true })
```

---

### `vehicles`

Un document par véhicule. Référence l'utilisateur propriétaire.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",

  "type": "auto",
  "brand": "Renault",
  "model": "Clio V",
  "year": 2021,
  "plate": "AB-123-CD",
  "vin": "VF1RJA00065XXXXXX",

  "fuel": "essence",
  "color": "gris",
  "purchaseDate": "ISODate",
  "purchaseMileage": 12000,

  "mileage": {
    "current": 45200,
    "updatedAt": "ISODate"
  },

  "nextService": {
    "date": "ISODate",
    "mileage": 55000,
    "label": "Vidange + filtres"
  },

  "notes": "Achetée d'occasion, carnet de révisions complet.",

  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Référence vers `users._id` |
| `type` | Enum | `"auto"` \| `"moto"` |
| `plate` | String | Immatriculation |
| `vin` | String | Numéro de châssis |
| `fuel` | Enum | `"essence"` \| `"diesel"` \| `"hybride"` \| `"electrique"` \| `"autre"` |
| `mileage.current` | Number | Kilométrage actuel (mis à jour à chaque entrée) |
| `nextService` | Object | Prochain entretien en vue — embarqué pour affichage rapide |

**Index :**
```js
db.vehicles.createIndex({ userId: 1 })
db.vehicles.createIndex({ userId: 1, plate: 1 }, { unique: true })
```

---

### `history`

Une entrée par événement ou opération sur un véhicule.
Collection volumineuse — les entrées ne sont **jamais modifiées**, seulement créées ou supprimées.

```json
{
  "_id": "ObjectId",
  "vehicleId": "ObjectId",
  "userId": "ObjectId",

  "date": "ISODate",
  "mileage": 44500,

  "type": "maintenance",
  "category": "vidange",

  "title": "Vidange + filtre à huile",
  "description": "Huile Castrol Edge 5W30, 4.5L. Filtre Bosch.",

  "garage": {
    "name": "Garage Dupont",
    "address": "12 rue des Lilas, 75011 Paris"
  },

  "parts": [
    { "name": "Huile Castrol Edge 5W30 5L", "reference": "CAS-5W30-5L", "quantity": 1 },
    { "name": "Filtre à huile Bosch", "reference": "BOX-OF001", "quantity": 1 }
  ],

  "cost": {
    "parts": 42.50,
    "labor": 30.00,
    "total": 72.50,
    "currency": "EUR"
  },

  "attachments": [
    { "type": "invoice", "url": "https://storage/.../facture.pdf", "label": "Facture garage" }
  ],

  "tags": ["fait-maison", "à-surveiller"],

  "createdAt": "ISODate"
}
```

#### Types et catégories

| `type` | `category` (exemples) |
|--------|----------------------|
| `maintenance` | `vidange`, `filtres`, `courroie`, `bougies`, `liquides` |
| `repair` | `freins`, `embrayage`, `suspension`, `electricite`, `carrosserie` |
| `inspection` | `controle-technique`, `revision-concessionnaire` |
| `refuel` | *(pas de catégorie — simple plein)* |
| `note` | *(information libre)* |

**Index :**
```js
db.history.createIndex({ vehicleId: 1, date: -1 })
db.history.createIndex({ userId: 1 })
db.history.createIndex({ vehicleId: 1, category: 1 })
db.history.createIndex({ tags: 1 })
```

---

### `maintenancePlans`

Planification des prochaines opérations. Peut être déclenchée par une date, un kilométrage, ou les deux.

```json
{
  "_id": "ObjectId",
  "vehicleId": "ObjectId",
  "userId": "ObjectId",

  "title": "Vidange huile moteur",
  "category": "vidange",
  "description": "Huile 5W30 + filtre. Tous les 10 000 km ou 1 an.",

  "trigger": {
    "type": "both",
    "date": "ISODate",
    "mileage": 55000
  },

  "recurrence": {
    "active": true,
    "intervalMonths": 12,
    "intervalMileage": 10000
  },

  "status": "pending",

  "lastDone": {
    "date": "ISODate",
    "mileage": 45000,
    "historyId": "ObjectId"
  },

  "alertBeforeDays": 30,
  "alertBeforeMileage": 1000,

  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `trigger.type` | Enum | `"date"` \| `"mileage"` \| `"both"` |
| `recurrence.active` | Boolean | Si `true`, recrée automatiquement le plan après complétion |
| `status` | Enum | `"pending"` \| `"done"` \| `"overdue"` \| `"snoozed"` |
| `lastDone.historyId` | ObjectId | Référence vers l'entrée `history` correspondante |
| `alertBeforeDays` | Number | Déclencher une alerte N jours avant la date prévue |
| `alertBeforeMileage` | Number | Déclencher une alerte à N km de l'échéance |

**Index :**
```js
db.maintenancePlans.createIndex({ vehicleId: 1, status: 1 })
db.maintenancePlans.createIndex({ userId: 1, status: 1 })
db.maintenancePlans.createIndex({ "trigger.date": 1, status: 1 })
db.maintenancePlans.createIndex({ "trigger.mileage": 1, status: 1 })
```

---

## Diagramme de relations

```
┌─────────────┐
│    users    │
│─────────────│
│ _id         │◄────────────────────────────┐
│ email       │                             │
│ passwordHash│                             │
│ profile     │                             │
└──────┬──────┘                             │
       │ 1                                  │
       │                                    │
       │ N                                  │
┌──────▼──────┐         ┌──────────────────────────┐
│  vehicles   │         │         history          │
│─────────────│         │──────────────────────────│
│ _id         │◄────────│ vehicleId                │
│ userId      │─────────► userId                   │
│ type        │  1    N │ date / mileage           │
│ brand/model │         │ type / category          │
│ mileage     │         │ title / description      │
│ nextService │         │ garage / parts / cost    │
└──────┬──────┘         │ attachments / tags       │
       │                └──────────────────────────┘
       │ 1
       │                ┌──────────────────────────┐
       │ N              │    maintenancePlans      │
       └───────────────►│──────────────────────────│
                        │ vehicleId                │
                        │ userId                   |
                        │ title / category         │
                        │ trigger (date/mileage)   │
                        │ recurrence               │
                        │ status / lastDone        │
                        └──────────────────────────┘
```

---

## Requêtes courantes

### Tous les véhicules d'un utilisateur
```js
db.vehicles.find({ userId: ObjectId("...") })
```

### Historique complet d'un véhicule (du plus récent au plus ancien)
```js
db.history.find(
  { vehicleId: ObjectId("...") },
  { sort: { date: -1 } }
)
```

### Maintenances en retard pour un utilisateur
```js
db.maintenancePlans.find({
  userId: ObjectId("..."),
  status: "overdue"
})
```

### Prochaines maintenances dans les 30 jours
```js
const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
db.maintenancePlans.find({
  userId: ObjectId("..."),
  status: "pending",
  "trigger.date": { $lte: in30days }
})
```

### Coût total des maintenances d'un véhicule sur une année
```js
db.history.aggregate([
  { $match: {
    vehicleId: ObjectId("..."),
    date: { $gte: ISODate("2024-01-01"), $lte: ISODate("2024-12-31") }
  }},
  { $group: {
    _id: null,
    totalCost: { $sum: "$cost.total" }
  }}
])
```

---

## Nommage des collections

| Collection | Stratégie de nommage |
|------------|---------------------|
| `users` | Pluriel, minuscule |
| `vehicles` | Pluriel, minuscule |
| `history` | Singulier collectif (ensemble d'événements) |
| `maintenancePlans` | camelCase pour noms composés |

---

## Règles de sécurité (multi-tenant)

- Chaque collection sensible (`vehicles`, `history`, `maintenancePlans`) porte un champ `userId`.
- Toute requête API **doit** inclure `userId` issu du token JWT — jamais fourni par le client.
- Un utilisateur ne peut jamais accéder aux données d'un autre, même en connaissant un `_id`.

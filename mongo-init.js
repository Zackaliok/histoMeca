// Script d'initialisation MongoDB
// Crée un utilisateur dédié à l'application histoMeca

db = db.getSiblingDB('histomeca');

db.createUser({
  user: 'histomeca',
  pwd: 'histomeca',
  roles: [{ role: 'readWrite', db: 'histomeca' }],
});

// Création des collections avec leurs index
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

db.createCollection('vehicles');
db.vehicles.createIndex({ userId: 1 });
db.vehicles.createIndex({ userId: 1, plate: 1 }, { unique: true });

db.createCollection('history');
db.history.createIndex({ vehicleId: 1, date: -1 });
db.history.createIndex({ userId: 1 });
db.history.createIndex({ vehicleId: 1, category: 1 });

db.createCollection('maintenancePlans');
db.maintenancePlans.createIndex({ vehicleId: 1, status: 1 });
db.maintenancePlans.createIndex({ userId: 1, status: 1 });
db.maintenancePlans.createIndex({ 'trigger.date': 1, status: 1 });
db.maintenancePlans.createIndex({ 'trigger.mileage': 1, status: 1 });

// Refresh tokens — TTL index : MongoDB supprime automatiquement les documents expirés
db.createCollection('refreshTokens');
db.refreshTokens.createIndex({ token: 1 }, { unique: true });
db.refreshTokens.createIndex({ userId: 1 });
db.refreshTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('histoMeca DB initialized.');

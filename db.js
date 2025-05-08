const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/mediaDB";
let client;
let db;

async function connectDB() {
  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    db = client.db();
    
    // Créer les collections si elles n'existent pas
    await db.collection('movies').createIndex({ id: 1 }, { unique: true });
    await db.collection('tvshows').createIndex({ id: 1 }, { unique: true });
    
    console.log("✅ Connecté à MongoDB avec succès");
    return db;
  } catch (e) {
    console.error("❌ Erreur de connexion à MongoDB:", e);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error("Database non initialisée");
  return db;
}

module.exports = { connectDB, getDB };
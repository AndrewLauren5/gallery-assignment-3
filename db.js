const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 
'mongodb+srv://andrewlaurenca:8PJgUGZB9GfKoxGH@cluster0.yh0jbex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('gallerydb');
  }
  return db;
}

async function getGalleryCollection() {
  const database = await connectDB();
  return database.collection('gallery');
}

module.exports = { connectDB, getGalleryCollection };

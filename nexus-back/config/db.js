const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

// THIS IS THE FIX: We explicitly tell it to look for the named database 'default'
const db = getFirestore(app, 'default'); 

module.exports = db;
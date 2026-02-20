const db = require('./config/db');

async function testConnection() {
  console.log("⏳ Attempting to connect to the 'default' named database...");
  try {
    const docRef = await db.collection('system_tests').add({
      status: 'Connection successful!',
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ SUCCESS! Connected to the database.");
    console.log("✅ Test document written with ID:", docRef.id);
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED TO CONNECT.");
    console.error("Error Details:", error.message);
    process.exit(1);
  }
}

testConnection();
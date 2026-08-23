const dns = require("dns");
const mongoose = require("mongoose");

// Some Windows setups fail the mongodb+srv:// DNS SRV lookup with the system's default
// resolver (Node's c-ares can't reach it) even though the OS itself can resolve it fine.
// Pointing Node at public DNS servers works around that.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — skipping database connection (set it in .env).");
    return;
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = { connectDb };

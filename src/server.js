require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db");
const profileRoutes = require("./routes/profile.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/profile", profileRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;

connectDb()
  .catch((err) => console.error("MongoDB connection failed:", err.message))
  .finally(() => {
    app.listen(port, () => console.log(`SesoDigital backend listening on port ${port}`));
  });

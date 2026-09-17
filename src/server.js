require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db");
const profileRoutes = require("./routes/profile.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const postsRoutes = require("./routes/posts.routes");
const photosRoutes = require("./routes/photos.routes");
const productsRoutes = require("./routes/products.routes");
const servicesRoutes = require("./routes/services.routes");
const auditRoutes = require("./routes/audit.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const performanceRoutes = require("./routes/performance.routes");
const keywordsRoutes = require("./routes/keywords.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/photos", photosRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/audit-requests", auditRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/keywords", keywordsRoutes);

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

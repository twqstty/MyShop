import "dotenv/config";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";

import authRouter from "./api/auth";
import ordersRouter from "./routes/orders";
import profileRouter from "./routes/profile";

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/profile", profileRouter);

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

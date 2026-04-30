"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const products_1 = __importDefault(require("./routes/products"));
const auth_1 = __importDefault(require("./api/auth"));
const orders_1 = __importDefault(require("./routes/orders"));
const profile_1 = __importDefault(require("./routes/profile"));
const support_1 = __importDefault(require("./routes/support"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/support", support_1.default);
app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
const PORT = Number(process.env.PORT) || 3000;
(0, socket_1.initSocketServer)(server);
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors"
import aiRouter from "./routes/aiRouter"
import authRouter from "./routes/authRouter"
import executionRouter from "./routes/executionRouter"

const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (_, res) => {
    res.status(200).json({ message: "Welcome to AurAI" });
})

app.get("/ping", (_, res) => {
    res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

app.use("/ai", aiRouter);
app.use("/execution", executionRouter);
app.use("/auth", authRouter);

app.listen(process.env.PORT || 3001, () => {
    console.log("Server started 🚀")
})

import express from "express";
import cors from "cors"
import aiRouter from "./routes/aiRouter"
import authRouter from "./routes/authRouter"

const app = express();
app.use(express.json()); 
app.use(cors())

app.use("/ai",aiRouter);
app.use("/auth",authRouter);

app.listen(3001,()=>{
    console.log("Server started on port 3001")
})

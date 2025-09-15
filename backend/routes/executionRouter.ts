import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { prisma } from "../utils/prismaClient";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const executions = await prisma.execution.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    res.json({
        executions
    })
});

router.get("/:executionId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const executionId = req.params.executionId;
    const execution = await prisma.execution.findFirst({
        where: {
            id: executionId,
            userId
        },
    })

    const conversations = await prisma.conversation.findMany({
        where: {
            id: execution?.externalId!
        }
    })

    res.json({
        response: conversations,
    })
})


export default router;
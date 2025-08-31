import { Router } from "express";
import { CreateChatType, Role } from "../types/type";
import { InMemoryStore } from "../lib/InMemoryStore";
import { createCompletion } from "../lib/opnerouter";
import { authMiddleware } from "../middleware/auth-middleware";
import { prisma } from "../utils/prismaClient";

const router = Router()

router.get("/conversations", authMiddleware, async (req, res) => {
    const userId = req.userId
    const conversations = await prisma.conversation.findMany({
        where: {
            userId
        }
    })

    res.json({ conversations })
})

router.get("/conversations/:conversationId", authMiddleware, async (req, res) => {
    const userId = req.userId
    const conversationId = req.params.conversationId
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })
    console.log(conversation,"conversation in get conversation");
    
    res.json({ conversation })
})

router.post("/chat", authMiddleware, async (req, res) => {
    const userId = req.userId
    const { success, data } = CreateChatType.safeParse(req.body)

    const conversationId = data?.conversationId ?? Bun.randomUUIDv7()

    if (!success) {
        res.status(411).json({
            message: "Incorrect Inputs"
        })
        return
    }

    let existingMessages = InMemoryStore.getInstance().get(conversationId)

    if (!existingMessages.length) {
        const messages = await prisma.message.findMany({
            where: {
                conversationId
            }
        })

        messages.map((message) => {
            InMemoryStore.getInstance().add(conversationId, {
                role: message.role as Role,
                content: message.content
            })
        })

        existingMessages = InMemoryStore.getInstance().get(conversationId)
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Connection", "keep-alive");
    let message = "";

    await createCompletion([...existingMessages, {
        role: Role.User,
        content: data.message
    }], data.model, (chunk: string) => {
        message += chunk
        res.write(chunk)
    })

    InMemoryStore.getInstance().add(conversationId, {
        role: Role.User,
        content: data.message
    })

    InMemoryStore.getInstance().add(conversationId, {
        role: Role.Agent,
        content: message
    })

    //Store it in DB
    if (!data.conversationId) {
        await prisma.conversation.create({
            data: {
                id: conversationId,
                title: data.message.slice(0, 20) + "...",
                userId,
            }
        })
    }

    console.log(data,"data in chat");
    
    await prisma.message.createMany({
        data: [{
            conversationId,
            content: data.message,
            role: Role.User
        },
        {
            conversationId,
            content: message,
            role: Role.Agent
        }

        ]
    })
})

export default router;
import express from "express";
import { CreateChatType, Role } from "./types/type";
import { createCompletion } from "./opnerouter";
import { InMemoryStore } from "./InMemoryStore";

const app = express();

app.post("/chat", async (req, res) => {
    const { success, data } = CreateChatType.safeParse(req.body)

    const conversationId = data?.conversationId ?? Bun.randomUUIDv7()

    if (!success) {
        res.status(411).json({
            message: "Incorrect Inputs"
        })
        return
    }

    let existingMessages = InMemoryStore.getInstance().get(conversationId)

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
    res.end()

    InMemoryStore.getInstance().add(conversationId, {
        role: Role.User,
        content: data.message
    })

    InMemoryStore.getInstance().add(conversationId, {
        role: Role.Agent,
        content: message
    })

    //Store it in DB
})

app.listen(3000)

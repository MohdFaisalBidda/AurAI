
import { z } from "zod";

const MAX_INPUT_TOKENS = 1000;
export type Model = "openai/gpt-oss-20b:free"

export const SUPPORTED_MODELS = ["openai/gpt-oss-20b:free"]
export type MODEL = typeof SUPPORTED_MODELS[number]

export const CreateChatType = z.object({
    conversationId: z.uuid().optional(),
    message: z.string().max(MAX_INPUT_TOKENS),
    model:z.enum(SUPPORTED_MODELS)
})

export enum Role { Agent="assistant", User="user" } 

export type Message = {
    content: string;
    role: Role;
}

export type Messages = Message[]

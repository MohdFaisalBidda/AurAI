
import { email, z } from "zod";

const MAX_INPUT_TOKENS = 1000;
export type Model = "openai/gpt-oss-20b:free" | "deepseek/deepseek-r1" | "google/gemini-2.5-flash-image-preview:free"

export const SUPPORTED_MODELS = ["openai/gpt-oss-20b:free", "deepseek/deepseek-r1", "google/gemini-2.5-flash-image-preview:free"]
export type MODEL = typeof SUPPORTED_MODELS[number]

export enum Role { Agent = "assistant", User = "user" }

export type Message = {
    content: string;
    role: Role;
}

export type Messages = Message[]

export const CreateChatType = z.object({
    conversationId: z.uuid().optional(),
    message: z.string().max(MAX_INPUT_TOKENS),
    model: z.enum(SUPPORTED_MODELS)
})

export const CreateUserType = z.object({
    email: z.email(),
})

export const SigIn = z.object({
    email: z.email(),
    otp: z.string()
})

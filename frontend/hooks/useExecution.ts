import { useEffect, useState } from "react";


export interface Execution {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    type: ExecutionType;
}

enum ExecutionType {
    CONVERSATION = "CONVERSATION",
    ARTICLE_SUMMARIZER = "ARTICLE_SUMMARIZER"
}

const BACKEND_URL = "http://localhost:3001";

export function useExecution() {
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createNewExecution = async () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const optimistic: Execution = {
            id,
            title: "New Conversation",
            createdAt: now,
            updatedAt: now,
            type: ExecutionType.CONVERSATION
        };

        const response = await fetch(`${BACKEND_URL}/execution/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                id,
                title: "New Conversation",
                type: ExecutionType.CONVERSATION
            })
        });

        const data = await response.json();

        setExecutions((prev) => [data, ...(Array.isArray(prev) ? prev : [])]);
        return id;
    }

    const fetchExecutions = async () => {
        const response = await fetch(`${BACKEND_URL}/execution`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = await response.json();
        console.log(data, "data of execution");

        setExecutions(data.executions);
    }

    const refreshExecutions = async () => {
        const response = await fetch(`${BACKEND_URL}/execution`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = await response.json();
        setExecutions(data.executions);
    }

    useEffect(() => {
        fetchExecutions();
    }, []);

    return { executions, loading, error, refreshExecutions, createNewExecution };
}
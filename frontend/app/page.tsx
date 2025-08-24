"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowUp, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const AI_MODELS = [{ id: "openai/gpt-oss-20b:free", name: "GPT-OSS-20B" }];

export default function Home() {
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <main className="flex w-full items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <div className="flex flex-col w-full max-w-2xl mx-auto h-screen">
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Start a conversation with the AI
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div key={`${message.id}-${i}`}>{part.text}</div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="p-4 dark:bg-neutral-900 border-t bg-neutral-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput("");
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" type="button">
                    {AI_MODELS.find((model) => model.id === selectedModel)
                      ?.name || "Select model"}
                    <ChevronDownIcon className="size-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-48 p-2">
                  <div className="flex flex-col gap-1">
                    {AI_MODELS.map((model) => (
                      <Button
                        key={model.id}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setSelectedModel(model.id);
                        }}
                      >
                        {model.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Enter your prompt"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800"
                // disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  // isLoading ||
                  !input.trim()
                }
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

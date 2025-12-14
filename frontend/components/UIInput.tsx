"use client";
// import { v4 } from "uuid";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  SpinnerGapIcon,
  CopyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowsLeftRightIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { ArrowUpIcon, WrapText } from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useConversationById } from "@/hooks/use-conversation-by-id";
import TabsSuggestion from "./ui/tabs-suggestions";
import { ModelSelector } from "./ui/model-selector";
import { DEFAULT_MODEL_ID } from "@/models";
import { BACKEND_URL } from "@/constants";
import { useUser } from "@/hooks/useUser";
// import { useCredits } from "@/hooks/useCredits";
// import { UpgradeCTA } from "@/components/ui/upgrade-cta";
// import { useExecutionContext } from "@/contexts/execution-context";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: true,
  display: "swap",
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UIInputProps {
  conversationId?: string;
}

const UIInput = ({
  conversationId: initialConversationId,
}: UIInputProps = {}) => {
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isWrapped, setIsWrapped] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const { resolvedTheme } = useTheme();
  const { user, loading: isUserLoading } = useUser();
  const { conversation, loading: converstionLoading } = useConversationById(
    initialConversationId
  );
  // const {
  //   userCredits,
  //   isLoading: isCreditsLoading,
  //   refetchCredits,
  // } = useCredits();
  // const { refreshExecutions } = useExecutionContext();
  const router = useRouter();

  const toggleWrap = useCallback(() => {
    setIsWrapped((prev) => !prev);
  }, []);

  useEffect(() => {
    if (conversation?.messages && conversationId === initialConversationId) {
      setMessages(conversation.messages);
      setShowWelcome(false);
    }
  }, [conversation, conversationId, initialConversationId]);

  useEffect(() => {
    if (initialConversationId && initialConversationId !== conversationId) {
      setConversationId(initialConversationId);
    }
  }, [initialConversationId, conversationId]);

  const processStream = async (response: Response, userMessage: string) => {
    if (!response.ok) {
      console.error("Error from API:", response.statusText);
      setIsLoading(false);
      return;
    }

    const tempMessageId = `ai-${Date.now()}`;
    let receivedConversationId = conversationId;

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No reader available");
        setIsLoading(false);
        return;
      }

      // Add the assistant message with empty content
      setMessages((prev) => [
        ...prev,
        { id: tempMessageId, role: "assistant", content: "" },
      ]);

      let accumulatedContent = "";
      let decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Final update when stream is complete
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Split by lines to handle SSE format
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;

          // Handle SSE format (data: {...})
          if (line.startsWith("data: ")) {
            const data = line.substring(6); // Remove "data: " prefix

            if (data === "[DONE]") {
              continue; // End of stream
            }

            try {
              const parsedData = JSON.parse(data);
              console.log("Parsed data:", parsedData);

              if (parsedData.conversationId && !receivedConversationId) {
                receivedConversationId = parsedData.conversationId;
                setConversationId(parsedData.conversationId);
                // Only navigate if this was a new conversation
                if (!initialConversationId) {
                  router.push(`/ask/${parsedData.conversationId}`);
                }
              }

              // Extract content based on different possible response formats
              const content =
                parsedData.content ||
                parsedData.message ||
                parsedData.choices?.[0]?.delta?.content ||
                parsedData.choices?.[0]?.message?.content;

              if (content) {
                accumulatedContent += content;
                // Update the UI immediately
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing JSON:", e, "Data:", data);
            }
          } else {
            // If it's not SSE format, try to parse as direct JSON
            try {
              const parsedData = JSON.parse(line);
              console.log("Direct JSON parsed:", parsedData);

              if (parsedData.conversationId && !receivedConversationId) {
                receivedConversationId = parsedData.conversationId;
                setConversationId(parsedData.conversationId);
                // Only navigate if this was a new conversation
                if (!initialConversationId) {
                  router.push(`/ask/${parsedData.conversationId}`);
                }
              }

              const content =
                parsedData.content ||
                parsedData.message ||
                parsedData.choices?.[0]?.delta?.content ||
                parsedData.choices?.[0]?.message?.content;

              if (content) {
                accumulatedContent += content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // If it's not JSON at all, treat as plain text
              console.log("Plain text content:", line);
              accumulatedContent += line + "\n";
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempMessageId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing stream:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, content: "Error: Failed to process response" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth");
      return;
    }

    // Check if user has credits
    // if (userCredits && userCredits.credits <= 0 && !userCredits.isPremium) {
    //   // Don't allow chat if no credits
    //   return;
    // }

    if (!query.trim() || isLoading) return;

    setShowWelcome(false);

    const currentQuery = query.trim();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentQuery,
    };

    setQuery("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: currentQuery,
          model: model,
          conversationId: conversationId,
        }),
        signal: abortControllerRef.current?.signal,
      });

      console.log(response, "response");
      console.log(response.headers, "response headers");

      // if (!conversationId && response.ok) {
      //   // Extract conversationId from response if needed, or rely on backend to return it
      //   // This depends on your backend API response format
      //   const responseData = await response.clone().json(); // Clone to read without consuming stream
      //   if (responseData.conversationId) {
      //     setConversationId(responseData.conversationId);

      //     // Also update the URL if this was a new conversation
      //     if (!initialConversationId) {
      //       router.push(`/ask/${responseData.conversationId}`);
      //     }
      //   }
      // }

      await processStream(response, currentQuery);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sending message:", error);
        // Add an error message to the UI
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, there was an error processing your request.",
          },
        ]);
      }
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (initialConversationId && converstionLoading) {
    return (
      <div className="flex w-full overflow-hidden h-[96dvh]">
        <div className="relative flex h-full w-full flex-col">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0s]"></div>
                <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0.2s] [animation-direction:reverse]"></div>
                <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0.4s]"></div>
              </div>
              <p className="text-muted-foreground text-sm">
                Loading conversation...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[96dvh] w-full overflow-hidden">
      <div className="relative flex h-full w-full flex-col">
        {!query && showWelcome && messages.length === 0 ? (
          <div className="flex h-full w-full flex-col">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <TabsSuggestion
                suggestedInput={query}
                setSuggestedInput={setQuery}
              />
            </div>
          </div>
        ) : (
          <div className="no-scrollbar flex h-full w-full flex-1 flex-col gap-4 overflow-y-auto px-4 pt-8 pb-14 md:px-8">
            <div className="mx-auto h-full w-full max-w-4xl">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group mb-8 pb-10 flex w-full flex-col ${
                    message.role === "assistant" ? "items-start" : "items-end"
                  } gap-2`}
                >
                  <div
                    className={cn(
                      "prose cursor-pointer dark:prose-invert max-w-none rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-[#2c2c2e] w-fit max-w-full font-medium"
                        : "w-full p-0"
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props) {
                          const { children, className, ...rest } = props;
                          const match = /language-(\w+)/.exec(className ?? "");
                          const isInline = !match;
                          const codeContent = Array.isArray(children)
                            ? children.join("")
                            : typeof children === "string"
                            ? children
                            : "";

                          return isInline ? (
                            <code
                              className={cn(
                                "bg-accent rounded-sm text-wrap px-1 py-0.5 text-sm",
                                geistMono.className
                              )}
                              {...rest}
                            >
                              {children}
                            </code>
                          ) : (
                            <div
                              className={`${geistMono.className} my-4 overflow-hidden rounded-md`}
                            >
                              <div className="bg-accent flex items-center justify-between px-4 py-2 text-sm">
                                <div>{match ? match[1] : "text"}</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={toggleWrap}
                                    className={`hover:bg-muted/40 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-all duration-200`}
                                    aria-label="Toggle line wrapping"
                                  >
                                    {isWrapped ? (
                                      <>
                                        <ArrowsLeftRightIcon
                                          weight="bold"
                                          className="h-3 w-3"
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <WrapText className="h-3 w-3" />
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleCopy(codeContent)}
                                    className={`hover:bg-muted/40 sticky top-10 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-all duration-200`}
                                    aria-label="Copy code"
                                  >
                                    {copied ? (
                                      <>
                                        <CheckCircleIcon
                                          weight="bold"
                                          className="size-4"
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <CopyIcon className="size-4" />
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <SyntaxHighlighter
                                language={match ? match[1] : "text"}
                                style={atomOneDark}
                                customStyle={{
                                  margin: 0,
                                  padding: "1rem",
                                  backgroundColor:
                                    resolvedTheme === "dark"
                                      ? "#2c2c2e"
                                      : "#f5ecf9",
                                  color:
                                    resolvedTheme === "dark"
                                      ? "#e5e5e5"
                                      : "#171717",
                                  borderRadius: 0,
                                  borderBottomLeftRadius: "0.375rem",
                                  borderBottomRightRadius: "0.375rem",
                                  fontSize: "1.2rem",
                                  fontFamily: `var(--font-geist-mono), ${geistMono.style.fontFamily}`,
                                }}
                                wrapLongLines={isWrapped}
                                codeTagProps={{
                                  style: {
                                    fontFamily: `var(--font-geist-mono), ${geistMono.style.fontFamily}`,
                                    fontSize: "0.85em",
                                    whiteSpace: isWrapped ? "pre-wrap" : "pre",
                                    overflowWrap: isWrapped
                                      ? "break-word"
                                      : "normal",
                                    wordBreak: isWrapped
                                      ? "break-word"
                                      : "keep-all",
                                  },
                                }}
                                PreTag="div"
                              >
                                {codeContent}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        strong: (props) => (
                          <span className="font-bold">{props.children}</span>
                        ),
                        a: (props) => (
                          <a
                            className="text-primary underline"
                            href={props.href}
                          >
                            {props.children}
                          </a>
                        ),
                        h1: (props) => (
                          <h1 className="my-4 text-2xl font-bold">
                            {props.children}
                          </h1>
                        ),
                        h2: (props) => (
                          <h2 className="my-3 text-xl font-bold">
                            {props.children}
                          </h2>
                        ),
                        h3: (props) => (
                          <h3 className="my-2 text-lg font-bold">
                            {props.children}
                          </h3>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className="font-medium">
                    {message.role === "assistant" && (
                      <div className="invisible flex w-fit items-center gap-2 text-base font-semibold group-hover:visible">
                        <button className="hover:bg-accent flex size-7 items-center justify-center rounded-lg">
                          <ThumbsUpIcon weight="bold" />
                        </button>
                        <button className="hover:bg-accent flex size-7 items-center justify-center rounded-lg">
                          <ThumbsDownIcon weight="bold" />
                        </button>
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="hover:bg-accent flex size-7 items-center justify-center rounded-lg"
                        >
                          {!copied ? (
                            <CopyIcon weight="bold" />
                          ) : (
                            <CheckIcon weight="bold" />
                          )}
                        </button>
                      </div>
                    )}
                    {message.role === "user" && (
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="hover:bg-accent flex size-7 items-center justify-center rounded-lg"
                      >
                        {!copied ? (
                          <CopyIcon weight="bold" />
                        ) : (
                          <CheckIcon weight="bold" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex h-5 items-start justify-start space-x-2">
                  <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0s]"></div>
                  <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0.2s] [animation-direction:reverse]"></div>
                  <div className="bg-accent h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:0.4s]"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Show upgrade prompt when user has no credits */}
        {/* {userCredits && userCredits.credits <= 0 && !userCredits.isPremium && (
          <div className="mb-4 w-full px-4 md:px-8">
            <div className="mx-auto w-full max-w-4xl">
              <UpgradeCTA variant="banner" />
            </div>
          </div>
        )} */}

        <div className="bg-muted/20 backdrop-blur-3xl border border-border/50 mb-4 w-full rounded-2xl p-1">
          <div className="mx-auto w-full max-w-4xl">
            <form
              onSubmit={handleCreateChat}
              className="bg-accent/30 dark:bg-accent/10 flex w-full flex-col rounded-xl p-3 drop-shadow-2xl"
            >
              <Textarea
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleCreateChat(e);
                  }
                }}
                placeholder={
                  // userCredits &&
                  // userCredits.credits <= 0 &&
                  // !userCredits.isPremium
                  //   ? "You need credits to start a chat. Please upgrade to continue."
                  //   :
                  "Ask your question"
                }
                className="h-[2rem] resize-none rounded-none border-none bg-transparent px-0 py-1 shadow-none ring-0 focus-visible:ring-0 dark:bg-transparent"
                // disabled={
                //   isLoading ||
                //   !!(
                //     userCredits &&
                //     userCredits.credits <= 0 &&
                //     !userCredits.isPremium
                //   )
                // }
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModelSelector
                    value={model}
                    onValueChange={setModel}
                    // disabled={
                    //   isLoading ||
                    //   !!(
                    //     userCredits &&
                    //     userCredits.credits <= 0 &&
                    //     !userCredits.isPremium
                    //   )
                    // }
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  // disabled={
                  //   isLoading ||
                  //   !query.trim() ||
                  //   !!(
                  //     userCredits &&
                  //     userCredits.credits <= 0 &&
                  //     !userCredits.isPremium
                  //   )
                  // }
                >
                  {isLoading ? (
                    <SpinnerGapIcon className="animate-spin" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIInput;

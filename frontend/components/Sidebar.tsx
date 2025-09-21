/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MagnifyingGlassIcon,
  ShareFatIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
// import { Logo } from "../svgs/logo";
// import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useExecutionContext } from "@/contexts/execution-context";
import { Execution } from "@/hooks/useExecution";
import { Conversation, useConversations } from "@/hooks/use-conversations";

export function Sideabar() {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [hoverChatId, setHoverChatId] = useState<string>("");
  const [isAppsDialogOpen, setIsAppsDialogOpen] = useState(false);
  const {
    conversations,
    createNewConversation,
    refreshConversations,
    deleteConversation,
    loading,
  } = useConversations();
  const router = useRouter();
  const params = useParams();
  const currentConversationId = params.id as string;

  useEffect(() => {
    if (conversations) {
      setAllConversations(conversations);
    }
  }, [conversations]);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const currentIndex = conversations.findIndex(
        (conv) => conv.id === conversationId
      );
      await deleteConversation(conversationId);
      await refreshConversations();
      toast.success("Chat deleted successfully");
      // Filter out the deleted conversation
      const updatedConversations = allConversations.filter(
        (conv) => conv.id !== conversationId
      );
      setAllConversations(updatedConversations);

      // Handle routing after deletion
      if (updatedConversations.length > 0) {
        // If there are remaining conversations, navigate to the next one
        if (currentIndex < updatedConversations.length) {
          // Navigate to the conversation at the same index (or the last one if index is out of bounds)
          const nextIndex = Math.min(
            currentIndex,
            updatedConversations.length - 1
          );
          router.push(`/ask/${updatedConversations[nextIndex].id}`);
        } else {
          // If we deleted the last item, navigate to the new last item
          router.push(
            `/ask/${updatedConversations[updatedConversations.length - 1].id}`
          );
        }
      } 
      // else {
      //   // If no conversations left, create a new one and navigate to it
      //   const id = await createNewConversation();
      //   router.push(`/ask/${id}`);
      //   await refreshConversations();
      // }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  //   const { user, isLoading: isUserLoading } = useUser();
  const user = false;
  const isUserLoading = false;
  const isLoding = false;

  // Available AI Apps
  const availableApps = [
    {
      id: "article-summarizer",
      name: "Article Summarizer",
      description:
        "Summarize long articles into concise, easy-to-read summaries",
      icon: "📄",
      credits: 2,
    },
  ];

  const handleAppNavigation = (appId: string) => {
    router.push(`/apps/${appId}/`);
    setIsAppsDialogOpen(false);
  };

  return (
    <Sidebar className={`bg-transparent py-2 pl-2 border-none`}>
      <SidebarContent className="h-full justify-between bg-transparent">
        <SidebarGroup className="flex flex-col gap-8">
          <SidebarHeader className="sticky top-0 !p-0">
            <div className="flex w-full flex-col items-center gap-2 rounded-lg">
              <div className="flex w-full items-center gap-2 rounded-lg p-1 text-lg justify-between">
                <SidebarTrigger className="shrink-0" />
                <h1 className={cn("text-2xl font-light text-foreground")}>
                  AurAI
                </h1>
                <span className="size-6"></span>
              </div>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  const id = await createNewConversation();
                  router.push(`/ask/${id}`);
                  await refreshConversations();
                }}
                variant="accent"
                className="w-full"
              >
                New Chat
              </Button>
            </div>

            <div className="flex items-center gap-2 md:py-2 border-b p-3 md:p-0 py-3">
              <MagnifyingGlassIcon className="text-foreground" weight="bold" />
              <Input
                placeholder="Search for chats"
                className="rounded-none border-none bg-transparent px-0 py-1 shadow-none ring-0 focus-visible:ring-0 dark:bg-transparent"
              />
            </div>
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu className="w-full p-0">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-primary/15 mb-2 h-7 w-full animate-pulse rounded-md"
                    />
                  ))
                : conversations.map((coversation: Conversation) => (
                    <SidebarMenuItem key={coversation.id}>
                      <SidebarMenuButton
                        className="group hover:bg-primary/20 relative"
                        onMouseEnter={() => setHoverChatId(coversation.id)}
                        onMouseLeave={() => setHoverChatId("")}
                        onClick={() => router.push(`/ask/${coversation.id}`)}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="z-[-1] cursor-pointer truncate">
                            {coversation.title}
                          </span>
                          <div
                            className={`absolute top-0 right-0 z-[5] h-full w-12 rounded-r-md blur-[2em] ${
                              coversation.id === hoverChatId ? "bg-primary" : ""
                            }`}
                          />
                          <div
                            className={`absolute top-1/2 -right-16 z-[10] flex h-full -translate-y-1/2 items-center justify-center gap-1.5 rounded-r-md bg-transparent px-1 backdrop-blur-xl transition-all duration-200 ease-in-out ${
                              coversation.id === hoverChatId
                                ? "group-hover:right-0"
                                : ""
                            }`}
                          >
                            <div
                              className="flex items-center justify-center rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                const shareLink =
                                  process.env.NEXT_PUBLIC_APP_URL +
                                  `/ask/${coversation.id}`;
                                navigator.clipboard.writeText(shareLink);
                                toast.success("Share link copied to clipboard");
                              }}
                            >
                              <ShareFatIcon
                                weight="fill"
                                className="hover:text-foreground hover:fill-black size-4"
                              />
                            </div>

                            <div
                              className="flex items-center justify-center rounded-md cursor-pointer"
                              onClick={() =>
                                handleDeleteConversation(coversation.id)
                              }
                            >
                              <TrashIcon
                                weight={"bold"}
                                className="hover:text-foreground hover:fill-red-500 size-4"
                              />
                            </div>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="sticky bottom-0 flex flex-col gap-2 w-full p-3 bg-transparent">
          {/* {!isUserLoading && !user && (
            <Link href="/auth">
              <Button variant="outline" className="w-full" size="lg">
                Login
              </Button>
            </Link>
          )} */}
          {/* <Dialog open={isAppsDialogOpen} onOpenChange={setIsAppsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full" size="lg">
                AI Apps
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>AI Apps</DialogTitle>
                <DialogDescription>
                  Choose from our collection of AI-powered applications to
                  enhance your productivity.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {availableApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleAppNavigation(app.id)}
                  >
                    <div className="text-2xl">{app.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {app.credits} credits per use
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}

          {user && (
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Logout
            </Button>
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

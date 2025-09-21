"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Conversation, useConversations } from "@/hooks/use-conversations";
import { useRouter } from "next/navigation";
interface Chat {
  id: string;
  updatedAt: Date;
  userId: string;
  messages: {
    content: string;
  }[];
}

const SidebarCollapsedOptions = () => {
  const { open } = useSidebar();
  const [isAppsDialogOpen, setIsAppsDialogOpen] = useState(false);
  const { createNewConversation, conversations, refreshConversations } =
    useConversations();
  console.log(conversations, "conversations in sidebar");

  const router = useRouter();

  return (
    <div
      className={`${
        open ? "bg-transparent" : "bg-background"
      } flex items-center gap-1 rounded-lg p-1`}
    >
      <SidebarTrigger className={open ? "lg:invisible" : "lg:flex"} />

      <Dialog open={isAppsDialogOpen} onOpenChange={setIsAppsDialogOpen}>
        <DialogTrigger
          className={cn(
            "hover:bg-muted flex size-7 items-center justify-center rounded-lg",
            open ? "invisible" : "flex"
          )}
        >
          <MagnifyingGlassIcon
            weight="bold"
            className={cn(open ? "invisible" : "flex cursor-pointer", "size-4")}
          />
        </DialogTrigger>
        <DialogContent className="border-none p-0">
          <DialogTitle className="hidden">Search bar</DialogTitle>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="no-scrollbar" heading="Recent Chats">
                {conversations?.map((chat: Conversation) => (
                  <CommandItem key={chat.id}>
                    <span
                      onClick={() => {
                        router.push(`/ask/${chat.id}`);
                        setIsAppsDialogOpen(false);
                      }}
                    >
                      {chat.messages?.[0]?.content}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
      <button
        onClick={async (e) => {
          e.preventDefault();
          const id = await createNewConversation();
          router.push(`/ask/${id}`);
          await refreshConversations();
        }}
        className={cn(
          "hover:bg-muted cursor-pointer flex size-7 items-center justify-center rounded-lg",
          open ? "invisible" : "flex"
        )}
      >
        <PlusIcon weight="bold" className={open ? "invisible" : "flex"} />
      </button>
    </div>
  );
};

export default SidebarCollapsedOptions;

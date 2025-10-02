import { Sideabar } from "@/components/Sidebar";
import SidebarCollapsedOptions from "@/components/SidebarCollapsedOptions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ExecutionProvider } from "@/contexts/execution-context";
import { ThemeProvider } from "next-themes";
import React from "react";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ExecutionProvider>
      <SidebarProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Sideabar />
          <SidebarInset className="!h-svh md:p-2">
            <div className="bg-[#060D0C] relative h-full max-h-svh w-full md:rounded-xl p-4 pt-0">
              <div className="absolute top-0 left-0 z-[50] flex h-12 w-full items-center justify-between px-3">
                <SidebarCollapsedOptions />
                <div className="flex items-center gap-2">
                  {/* <UpgradeCTA variant="topbar" />
                      <SelectTheme /> */}
                </div>
              </div>
              <div className="mx-auto flex max-h-fit w-full max-w-4xl flex-col overflow-y-hidden">
                <div className="flex-1">{children}</div>
              </div>
            </div>
          </SidebarInset>
        </ThemeProvider>
      </SidebarProvider>
    </ExecutionProvider>
  );
}

export default layout;

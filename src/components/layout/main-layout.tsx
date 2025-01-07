"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { RESIZABLE_PANELS_LAYOUT_COOKIE_NAME } from "@/constants";
import { cn } from "@/lib/utils";
import AppFooter from "../global/app-footer";
import HomeHeader from "../home/header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function MainLayout({
  initialLayout = [50, 50],
  leftPanel,
  rightPanel,
  className,
}: {
  initialLayout: number[];
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const onLayout = (sizes: number[]) => {
    document.cookie = `${RESIZABLE_PANELS_LAYOUT_COOKIE_NAME}=${JSON.stringify(sizes)}`;
  };

  return (
    <>
      <HomeHeader className="mb-4 mt-6 h-12" />
      <main className="h-[calc(100vh-theme(spacing.40))]">
        <div
          className={cn(
            "container mx-auto h-full overflow-hidden bg-background sm:rounded-lg sm:border",
            "lg:min-w-[1024px]",
            className
          )}
        >
          {/* Mobile Layout */}
          <div className="flex h-full flex-col lg:hidden">
            <div className="flex items-center justify-end border-b px-4 py-2">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] p-0">
                  <div className="h-full overflow-y-auto">{rightPanel}</div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex-1 overflow-y-auto">{leftPanel}</div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden h-full lg:block">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full min-h-0"
              onLayout={onLayout}
            >
              <ResizablePanel
                defaultSize={initialLayout[0]}
                className="!overflow-y-auto"
              >
                {leftPanel}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={initialLayout[1]}
                className="!overflow-y-auto"
              >
                {rightPanel}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </main>
      <AppFooter className="mt-4 h-14" />
    </>
  );
}

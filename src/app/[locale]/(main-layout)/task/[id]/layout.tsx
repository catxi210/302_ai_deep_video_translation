"use client";

import HomeHeader from "@/components/home/header";
import AppFooter from "@/components/global/app-footer";

export default function TaskDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeHeader className="mb-4 mt-6 h-12" />
      <main className="h-[calc(100vh-theme(spacing.40))]">
        <div className="container mx-auto h-full overflow-hidden bg-background sm:rounded-lg sm:border lg:min-w-[1024px]">
          {children}
        </div>
      </main>
      <AppFooter className="mt-4 h-14" />
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function TaskHeader() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="mb-6 flex items-center">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("task.back")}
      </Button>
    </div>
  );
}

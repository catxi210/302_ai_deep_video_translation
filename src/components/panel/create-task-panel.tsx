"use client";

import { createTaskStackAtom } from "@/stores/slices/stack_store";
import { useAtom } from "jotai";
import { useMemo, useRef } from "react";
import { createTaskStackPages } from "../stack/create-task-panel/stack-pages";
import { Stack, StackRef } from "../ui/stack";

export const CreateTaskPanel = () => {
  const stackRef = useRef<StackRef>(null);
  const [currentStack, setCurrentStack] = useAtom(createTaskStackAtom);

  const stackPages = useMemo(
    () =>
      Object.entries(createTaskStackPages).map(([id, render]) => ({
        id,
        component: render(stackRef),
      })),
    []
  );

  return (
    <Stack
      ref={stackRef}
      defaultStack={stackPages}
      defaultActiveId={currentStack}
      onStackChange={(id) => setCurrentStack(id as typeof currentStack)}
      className="size-full p-6"
    />
  );
};

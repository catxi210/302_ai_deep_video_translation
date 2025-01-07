"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface StackProps {
  defaultStack: {
    id: string;
    component: React.ReactNode;
  }[];
  defaultActiveId?: string;
  onStackChange?: (id: string) => void;
  className?: string;
}

export interface StackRef {
  push: (id: string) => void;
  pop: () => void;
  reset: () => void;
}

export const Stack = forwardRef<StackRef, StackProps>(
  ({ defaultStack, defaultActiveId, onStackChange, className }, ref) => {
    const [stack, setStack] = useState<typeof defaultStack>(() => {
      if (defaultActiveId) {
        const targetIndex = defaultStack.findIndex(
          (item) => item.id === defaultActiveId
        );
        if (targetIndex !== -1) {
          return defaultStack.slice(0, targetIndex + 1);
        }
      }
      return [defaultStack[0]];
    });

    // 监听 defaultActiveId 的变化
    useEffect(() => {
      if (defaultActiveId) {
        const targetIndex = defaultStack.findIndex(
          (item) => item.id === defaultActiveId
        );
        if (
          targetIndex !== -1 &&
          stack[stack.length - 1].id !== defaultActiveId
        ) {
          setStack(defaultStack.slice(0, targetIndex + 1));
        }
      }
    }, [defaultActiveId, defaultStack]);

    useImperativeHandle(ref, () => ({
      push: (id) => {
        const targetIndex = defaultStack.findIndex((item) => item.id === id);
        if (targetIndex !== -1) {
          const newStack = [...defaultStack.slice(0, targetIndex + 1)];
          setStack(newStack);
          onStackChange?.(id);
        }
      },
      pop: () => {
        if (stack.length > 1) {
          const newStack = stack.slice(0, -1);
          setStack(newStack);
          onStackChange?.(newStack[newStack.length - 1].id);
        }
      },
      reset: () => {
        setStack([defaultStack[0]]);
        onStackChange?.(defaultStack[0].id);
      },
    }));

    return (
      <div className={cn("relative", className)}>
        {stack[stack.length - 1].component}
      </div>
    );
  }
);

Stack.displayName = "Stack";

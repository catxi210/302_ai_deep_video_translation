import { StackRef } from "@/components/ui/stack";
import { RefObject } from "react";
import { OnlineStack } from "./online-stack";
import { UploadStack } from "./upload-stack";

export type CreateTaskStackPage = "upload" | "online";

export const createTaskStackPages = {
  upload: (stackRef: RefObject<StackRef>) => (
    <UploadStack stackRef={stackRef} />
  ),
  online: (stackRef: RefObject<StackRef>) => (
    <OnlineStack stackRef={stackRef} />
  ),
} as const;

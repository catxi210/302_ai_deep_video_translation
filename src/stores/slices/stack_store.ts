import { CreateTaskStackPage } from "@/components/stack/create-task-panel/stack-pages";
import { atomWithStorage } from "jotai/utils";

export const createTaskStackAtom = atomWithStorage<CreateTaskStackPage>(
  "create-task-stack",
  "upload"
);

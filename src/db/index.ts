import Dexie, { Table } from "dexie";
import { ManagedTask } from "@/types/task-manager";

class VideoTranslationDB extends Dexie {
  tasks!: Table<ManagedTask>;

  constructor() {
    super("VideoTranslationDB");
    this.version(3).stores({
      tasks:
        "id, name, createdAt, updatedAt, status, isActive, currentStep, settings.sourceLanguage, settings.targetLanguage",
    });
  }
}

export const db = new VideoTranslationDB();

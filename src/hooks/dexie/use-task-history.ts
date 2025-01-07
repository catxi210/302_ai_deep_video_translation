import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useTranslations } from "next-intl";
import { GloablTaskStatus } from "@/stores";
import { ManagedTask } from "@/types/task-manager";
import { createScopedLogger } from "@/utils";

const logger = createScopedLogger("use-task-history");

export type TaskFilter = {
  search?: string;
  status?: GloablTaskStatus[];
  sourceLanguage?: string;
  targetLanguage?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type TaskSort = {
  field: keyof ManagedTask;
  direction: "asc" | "desc";
};

const DEFAULT_SORT: TaskSort = {
  field: "createdAt",
  direction: "desc",
};

export function useTaskHistory(
  filter?: TaskFilter,
  sort: TaskSort = DEFAULT_SORT
) {
  const t = useTranslations();

  const tasks = useLiveQuery(async () => {
    try {
      // Choose initial query method based on sort field
      let query =
        sort.field === "createdAt" || sort.field === "updatedAt"
          ? db.tasks.orderBy(sort.field)
          : db.tasks.toCollection();

      // Apply filters
      if (filter) {
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          query = query.filter((task) => {
            const taskName = task.name?.toLowerCase();
            const taskSourceLanguage = t(
              `form.fields.language.${task.settings.sourceLanguage}`
            ).toLowerCase();
            const taskTargetLanguage = t(
              `form.fields.language.${task.settings.targetLanguage}`
            ).toLowerCase();
            const taskStatus = t(`task.status.${task.status}`).toLowerCase();
            return (
              taskName?.includes(searchLower) ||
              taskSourceLanguage?.includes(searchLower) ||
              taskTargetLanguage?.includes(searchLower) ||
              taskStatus?.includes(searchLower)
            );
          });
        }

        if (filter.status?.length) {
          query = query.filter((task) => filter.status!.includes(task.status));
        }

        if (filter.sourceLanguage) {
          query = query.filter(
            (task) => task.settings.sourceLanguage === filter.sourceLanguage
          );
        }

        if (filter.targetLanguage) {
          query = query.filter(
            (task) => task.settings.targetLanguage === filter.targetLanguage
          );
        }

        if (filter.dateRange) {
          query = query.filter((task) => {
            if (!task.createdAt) return false;
            return (
              task.createdAt >= filter.dateRange!.start &&
              task.createdAt <= filter.dateRange!.end
            );
          });
        }
      }

      // Get results
      let results = await (sort.field === "createdAt" ||
      sort.field === "updatedAt"
        ? sort.direction === "desc"
          ? query.reverse().toArray()
          : query.toArray()
        : query.toArray());

      // Sort non-date fields in memory
      if (sort.field !== "createdAt" && sort.field !== "updatedAt") {
        results = results.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];

          if (!aValue && !bValue) return 0;
          if (!aValue) return 1;
          if (!bValue) return -1;

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sort.direction === "desc"
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return sort.direction === "desc"
              ? bValue - aValue
              : aValue - bValue;
          }

          return 0;
        });
      }

      return results;
    } catch (error) {
      logger.error("Error fetching tasks:", error);
      return [];
    }
  }, [filter, sort, t]);

  const addTask = async (task: ManagedTask) => {
    await db.tasks.add(task);
  };

  const updateTask = async (id: string, updates: Partial<ManagedTask>) => {
    await db.tasks.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTask = async (id: string) => {
    await db.tasks.delete(id);
  };

  const getTask = async (id: string) => {
    return await db.tasks.get(id);
  };

  const bulkDelete = async (ids: string[]) => {
    await db.tasks.bulkDelete(ids);
  };

  const bulkUpdate = async (ids: string[], updates: Partial<ManagedTask>) => {
    return await db.tasks.bulkUpdate(
      ids.map((id) => ({
        key: id,
        changes: { ...updates, updatedAt: new Date() },
      }))
    );
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    bulkDelete,
    bulkUpdate,
  };
}

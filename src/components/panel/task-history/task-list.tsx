import { ManagedTask } from "@/types/task-manager";
import { TaskItem } from "./task-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";

interface TaskListProps {
  tasks?: ManagedTask[];
  onDeleteTask: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onResumeTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
  isTaskActive: (taskId: string) => boolean;
  isFiltered: boolean;
}

export const TaskList = ({
  tasks,
  onDeleteTask,
  onViewTask,
  onPauseTask,
  onResumeTask,
  onCancelTask,
  isTaskActive,
  isFiltered,
}: TaskListProps) => {
  const t = useTranslations();

  if (!tasks?.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          {isFiltered ? t("task.no_search_results") : t("task.no_tasks")}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={() => onDeleteTask(task.id)}
            onView={() => onViewTask(task.id)}
            onPause={() => onPauseTask(task.id)}
            onResume={() => onResumeTask(task.id)}
            onCancel={() => onCancelTask(task.id)}
            isActive={isTaskActive(task.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

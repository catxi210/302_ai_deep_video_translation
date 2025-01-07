import { apiKy } from "@/api";
import useSWR from "swr";
import { TaskStatus } from "@/stores/slices/current_task";

export interface TaskResult<T = any> {
  result: T;
  status: TaskStatus;
  progress?: number;
}

// Hook version for components
export const useTaskStatus = <T>(taskId?: string, interval = 1000) => {
  return useSWR<TaskResult<T>>(
    taskId ? ["302/vt/tasks/subtitle", taskId] : null,
    async (args: readonly [string, string]) => getTaskStatus(args[1]),
    {
      refreshInterval: interval,
      refreshWhenHidden: true,
      refreshWhenOffline: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      isPaused: () => false,
    }
  );
};

// Non-hook version for direct API calls
export const getTaskStatus = async <T>(
  taskId: string
): Promise<TaskResult<T>> => {
  return await apiKy
    .get(`302/vt/tasks/subtitle/${taskId}`)
    .json<TaskResult<T>>();
};

import { apiKy } from "@/api";
import useSWRMutation from "swr/mutation";
import { useTaskStatus } from "./use-task-status";
import { SubtitleSegment } from "@/stores";

interface ExtractResult {
  task_id: string;
}

interface ExtractTaskResult {
  subtitle: {
    segments: SubtitleSegment[];
  };
}

async function startExtract(
  url: string,
  { arg }: { arg: { audio_url: string; language: string; demucs?: boolean } }
) {
  const response = await apiKy
    .post("302/vt/subtitle/extract", {
      json: arg,
    })
    .json<ExtractResult>();
  return response;
}

export const useSubtitleExtract = () => {
  const {
    trigger,
    data: extractResult,
    error: extractError,
    isMutating,
  } = useSWRMutation("302/vt/subtitle/extract", startExtract);

  // const { data: taskResult, error: taskError } =
  //   useTaskStatus<ExtractTaskResult>(extractResult?.task_id);

  return {
    startExtract: trigger,
    // isExtracting:
    //   isMutating ||
    //   taskResult?.status === "processing" ||
    //   taskResult?.status === "queue",
    // extractResult: taskResult?.result?.subtitle?.segments,
    // error: extractError || taskError,
    // status: taskResult?.status,
  };
};

import { apiKy } from "@/api";
import useSWRMutation from "swr/mutation";

export interface DownloadResult {
  task_id: string;
}

export interface DownloadTaskResult {
  video_url: string;
  audio_url: string;
}

async function startDownload(
  url: string,
  { arg }: { arg: { url: string; resolution?: number } }
) {
  const response = await apiKy
    .post("302/vt/video/download", {
      json: arg,
    })
    .json<DownloadResult>();
  return response;
}

export const useVideoDownload = () => {
  const {
    trigger,
    data: downloadResult,
    error: downloadError,
    isMutating,
  } = useSWRMutation("302/vt/video/download", startDownload);

  // const { data: taskResult, error: taskError } =
  //   useTaskStatus<DownloadTaskResult>(downloadResult?.task_id);

  return {
    startDownload: trigger,
    // isDownloading:
    //   isMutating ||
    //   taskResult?.status === "processing" ||
    //   taskResult?.status === "queue",
    // downloadResult: taskResult?.result,
    // error: downloadError || taskError,
    // status: taskResult?.status,
  };
};

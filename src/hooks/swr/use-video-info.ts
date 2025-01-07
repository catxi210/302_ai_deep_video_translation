import { apiKy } from "@/api";
import { RawVideoFormat } from "@/utils/video-format";
import useSWRMutation from "swr/mutation";

export interface VideoInfo {
  info: {
    duration: number;
    formats: RawVideoFormat[];
    id: string;
    thumbnail: string;
    title: string;
  };
}

export interface VideoInfoError {
  error: {
    err_code: number;
    message: string;
  };
}

async function getVideoInfo(
  url: string,
  { arg }: { arg: { videoUrl: string } }
) {
  const response = await apiKy
    .get("302/vt/video/info", {
      searchParams: {
        url: arg.videoUrl,
      },
    })
    .json<VideoInfo | VideoInfoError>();

  if ("error" in response) {
    throw new Error(response.error.message);
  }
  return response;
}

export const useVideoInfo = () => {
  return useSWRMutation("302/vt/video/info", getVideoInfo);
};

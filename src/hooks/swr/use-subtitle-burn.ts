import { apiKy } from "@/api";
import useSWRMutation from "swr/mutation";
import { SrtSubtitle } from "@/stores";

interface BurnResult {
  task_id: string;
}

interface BurnTaskResult {
  video_url: string;
}

interface BurnParams {
  url: string;
  src_subtitle?: SrtSubtitle[];
  trans_subtitle?: SrtSubtitle[];
  output_width?: number;
  output_height?: number;
  src_font_name?: string;
  src_font_size?: number;
  src_font_color?: string;
  src_back_color?: string;
  src_outline_width?: number;
  src_shadow_color?: string;
  src_margin_v?: number;
  trans_font_name?: string;
  trans_font_size?: number;
  trans_font_color?: string;
  trans_outline_color?: string;
  trans_outline_width?: number;
  trans_back_color?: string;
  trans_margin_v?: number;
}

async function startBurn(url: string, { arg }: { arg: BurnParams }) {
  const response = await apiKy
    .post("302/vt/subtitle/burn", {
      json: arg,
    })
    .json<BurnResult>();
  return response;
}

export const useSubtitleBurn = () => {
  const {
    trigger,
    data: burnResult,
    error: burnError,
    isMutating,
  } = useSWRMutation("302/vt/subtitle/burn", startBurn);

  // const { data: taskResult, error: taskError } = useTaskStatus<BurnTaskResult>(
  //   burnResult?.task_id
  // );

  return {
    startBurn: trigger,
    // isBurning:
    //   isMutating ||
    //   taskResult?.status === "processing" ||
    //   taskResult?.status === "queue",
    // burnResult: taskResult?.result,
    // error: burnError || taskError,
    // status: taskResult?.status,
  };
};

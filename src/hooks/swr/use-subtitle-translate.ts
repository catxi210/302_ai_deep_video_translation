import { apiKy } from "@/api";
import useSWRMutation from "swr/mutation";
import { useTaskStatus } from "./use-task-status";
import { SubtitleSegment } from "@/stores";
import { SrtSubtitle } from "@/stores";

interface TranslateResult {
  task_id: string;
}

interface TranslateTaskResult {
  src_subtitle: SrtSubtitle[];
  trans_subtitle: SrtSubtitle[];
}

interface TranslateParams {
  model: string;
  src_lang: string;
  tgt_lang: string;
  subtitle: {
    segments: SubtitleSegment[];
  };
}

async function startTranslate(url: string, { arg }: { arg: TranslateParams }) {
  const response = await apiKy
    .post("302/vt/subtitle/translate", {
      json: arg,
    })
    .json<TranslateResult>();
  return response;
}

export const useSubtitleTranslate = () => {
  const {
    trigger,
    data: translateResult,
    error: translateError,
    isMutating,
  } = useSWRMutation("302/vt/subtitle/translate", startTranslate);

  // const { data: taskResult, error: taskError } =
  //   useTaskStatus<TranslateTaskResult>(translateResult?.task_id);

  return {
    startTranslate: trigger,
    // isTranslating:
    //   isMutating ||
    //   taskResult?.status === "processing" ||
    //   taskResult?.status === "queue",
    // translateResult: taskResult?.result,
    // error: translateError || taskError,
    // status: taskResult?.status,
  };
};

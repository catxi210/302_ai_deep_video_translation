import MainLayout from "@/components/layout/main-layout";
import { CreateTaskPanel } from "@/components/panel/create-task-panel";
import { TaskHistoryPanel } from "@/components/panel/task-history-panel";
import { RESIZABLE_PANELS_LAYOUT_COOKIE_NAME } from "@/constants/values";
import { cookies } from "next/headers";

export default function Home() {
  const cookieLayout = cookies().get(
    RESIZABLE_PANELS_LAYOUT_COOKIE_NAME
  )?.value;
  const initialLayout = cookieLayout ? JSON.parse(cookieLayout) : [50, 50];

  return (
    <MainLayout
      initialLayout={initialLayout}
      leftPanel={<CreateTaskPanel />}
      rightPanel={<TaskHistoryPanel className="p-6" />}
    />
  );
}

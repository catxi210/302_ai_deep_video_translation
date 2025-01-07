import { env } from "@/env";

export type MenuProps = {
  label: string;
  path: string;
  needAuth?: boolean;
};

export const APP_ROUTE_MENU: MenuProps[] = [
  {
    label: "home.title",
    path: "/",
    needAuth: true,
  },
  {
    label: "auth.title",
    path: env.NEXT_PUBLIC_AUTH_PATH,
    needAuth: false,
  },
];

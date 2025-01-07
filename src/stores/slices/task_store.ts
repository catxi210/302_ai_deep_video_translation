import { atom } from "jotai";

export const activeTasksAtom = atom<Set<string>>(new Set<string>());

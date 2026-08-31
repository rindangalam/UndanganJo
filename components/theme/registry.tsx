import type { ReactElement } from "react";
import type { Invitation } from "@/components/builder/types";
import Sastra from "./templates/sastra";
import Noir from "./templates/noir";
import Garden from "./templates/garden";
import Terracotta from "./templates/terracotta";
import Romantic from "./templates/romantic";

export type ThemeKey =
  | "sastra"
  | "noir"
  | "garden"
  | "terracotta"
  | "romantic";

export interface ThemeTemplateProps {
  invitation: Invitation;
}

export type ThemeTemplate = (props: ThemeTemplateProps) => ReactElement;

const KNOWN_KEYS: ThemeKey[] = ["sastra", "noir", "garden", "terracotta", "romantic"];

export function themeKeyOf(key: string | null | undefined): ThemeKey {
  return KNOWN_KEYS.includes(key as ThemeKey) ? (key as ThemeKey) : "sastra";
}

export const themeRegistry: Record<ThemeKey, ThemeTemplate> = {
  sastra: Sastra,
  noir: Noir,
  garden: Garden,
  terracotta: Terracotta,
  romantic: Romantic,
};

export function renderTheme(key: ThemeKey, invitation: Invitation) {
  const Template = themeRegistry[key] ?? Sastra;
  return <Template invitation={invitation} />;
}

import type { Invitation } from "@/components/builder/types";
import { themeKeyOf, renderTheme } from "@/components/theme/registry";

export default function InvitationPage({
  invitation,
  themeKey,
}: {
  invitation: Invitation;
  themeKey?: string | null;
}) {
  return renderTheme(themeKeyOf(themeKey), invitation);
}

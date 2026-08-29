import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SignOutButton from "@/app/(customer)/dashboard/sign-out-button";
import {
  IconDashboard,
  IconInvitations,
  IconGroup,
  IconGift,
  IconSettings,
  IconAdd,
  IconLogout,
} from "@/components/icons";

export default async function DashboardSidebar({
  active = "dashboard",
}: {
  active?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const name = profile?.full_name || user?.email || "Pengguna";

  const items = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: IconDashboard },
    { id: "invitations", label: "Invitations", href: "/dashboard", icon: IconInvitations },
    { id: "guests", label: "Guest List", href: "/dashboard", icon: IconGroup },
    { id: "registry", label: "Registry", href: "/dashboard", icon: IconGift },
    { id: "settings", label: "Settings", href: "/dashboard", icon: IconSettings },
  ];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-linen-bg p-4 md:flex">
      <div className="mb-8 flex justify-center py-2">
        <Link
          href="/"
          className="font-serif text-2xl font-medium text-rosewood-ink"
        >
          UndanganJo
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const activeItem = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                activeItem
                  ? "bg-rosewood-ink font-semibold text-linen-bg"
                  : "text-onsurface-variant hover:bg-surface-variant"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard/new"
        className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-rosewood-ink px-4 py-3 text-label-sm font-semibold uppercase tracking-widest text-linen-bg transition hover:bg-inverse-surface"
      >
        <IconAdd className="h-4 w-4" />
        New Project
      </Link>

      <div className="border-t border-outline-variant pt-4">
        <div className="mb-2 flex items-center gap-3 px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low font-serif text-lg text-rosewood-ink">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-onsurface">
              {name}
            </p>
            <p className="text-xs text-onsurface-variant">Rosewood Member</p>
          </div>
        </div>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-onsurface-variant transition hover:bg-surface-variant"
        >
          <IconSettings className="h-5 w-5" />
          Support
        </Link>
        <SignOutButton className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-onsurface-variant transition hover:bg-surface-variant">
          <IconLogout className="h-5 w-5" />
          Sign Out
        </SignOutButton>
      </div>
    </aside>
  );
}

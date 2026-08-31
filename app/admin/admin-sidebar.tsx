import Link from "next/link";
import {
  IconDashboard,
  IconInvitations,
  IconOrders,
  IconSettings,
  IconPerson,
  IconGroup,
  IconAdd,
} from "@/components/icons";

export type AdminSection = "overview" | "invitations" | "orders" | "settings" | "profile" | "guests";

const NAV: { id: AdminSection; label: string; href: string; icon: typeof IconDashboard }[] = [
  { id: "invitations", label: "Invitations", href: "/admin/invitations", icon: IconInvitations },
  { id: "orders", label: "Orders", href: "/admin", icon: IconOrders },
  { id: "guests", label: "RSVP & Ucapan", href: "/admin/guests", icon: IconGroup },
  { id: "overview", label: "Overview", href: "/admin/overview", icon: IconDashboard },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: IconSettings },
  { id: "profile", label: "Profile", href: "/admin", icon: IconPerson },
];

export default function AdminSidebar({ active }: { active: AdminSection }) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-surface p-4 lg:flex">
      <div className="mb-8 flex justify-center py-2">
        <Link href="/" className="font-serif text-2xl font-medium text-rosewood-ink">
          UndanganJo
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-rosewood-ink font-semibold text-linen-bg"
                  : "text-onsurface-variant hover:bg-surface-container-low"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/admin/invitations/new"
        className="flex w-full items-center justify-center gap-2 rounded bg-rosewood-ink px-4 py-3 text-label-sm font-semibold uppercase tracking-widest text-linen-bg transition hover:bg-inverse-surface"
      >
        <IconAdd className="h-4 w-4" />
        New Manual Invitation
      </Link>
    </aside>
  );
}

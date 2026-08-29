import { signOut } from "@/app/(auth)/actions";

export default function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={signOut} className="contents">
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-onsurface transition hover:bg-surface-container"
        }
      >
        {children ?? "Keluar"}
      </button>
    </form>
  );
}

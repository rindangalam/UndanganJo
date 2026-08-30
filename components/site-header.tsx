import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-sastra-hairline bg-sastra-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight text-sastra-ink"
        >
          UndanganJo
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/tema"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Themes
          </Link>
          <Link
            href="/#features"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Pricing
          </Link>
          <Link
            href="/#features"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Studio
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-body-md text-sastra-ink transition-colors hover:text-sastra-ink/80 md:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-sastra-ink-soft px-5 py-2.5 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
          >
            Create Invitation
          </Link>
        </div>
      </div>
    </header>
  );
}

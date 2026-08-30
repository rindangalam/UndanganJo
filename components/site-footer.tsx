export default function SiteFooter() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-4 border-t border-sastra-hairline bg-sastra-paper px-8 py-10 text-center">
      <h2 className="font-serif text-2xl font-medium italic text-sastra-ink">
        UndanganJo
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {["Privacy Policy", "Terms of Service", "Contact Us", "Instagram"].map(
          (label) => (
            <a
              key={label}
              href="#"
              className="text-body-md text-sastra-dim transition-colors underline-offset-4 hover:text-sastra-ink hover:underline"
            >
              {label}
            </a>
          )
        )}
      </div>
      <p className="mt-2 text-body-md text-sastra-dim">
        © 2026 UndanganJo Digital Studio. Crafted for love.
      </p>
    </footer>
  );
}
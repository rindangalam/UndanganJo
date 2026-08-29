import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvitation } from "@/lib/actions/invitation";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function NewInvitationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, price, description, max_photos, has_music, has_video")
    .eq("is_active", true)
    .order("price", { ascending: true });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rosewood-ink">
        Undangan Baru
      </p>
      <h1 className="mt-1 font-serif text-3xl font-medium text-onsurface">
        Pilih paket
      </h1>
      <p className="mt-2 text-sm text-onsurface-variant">
        Pembayaran dilakukan setelah undangan diisi dan dipreview.
      </p>

      {!packages || packages.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-14 text-center text-sm text-onsurface-variant">
          Belum ada paket tersedia. Silakan hubungi admin.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {packages.map((pkg) => (
            <form
              key={pkg.id}
              action={createInvitation.bind(null, pkg.id)}
              className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-white p-5"
            >
              <div>
                <h2 className="text-lg font-semibold text-onsurface">
                  {pkg.name}
                </h2>
                <p className="mt-1 text-2xl font-semibold text-rosewood-ink">
                  {formatIDR(pkg.price)}
                </p>
                {pkg.description && (
                  <p className="mt-3 text-sm text-onsurface-variant">{pkg.description}</p>
                )}
                <ul className="mt-4 space-y-1 text-sm text-onsurface-variant">
                  <li>• {pkg.max_photos} foto</li>
                  <li>• {pkg.has_music ? "Musik latar" : "Tanpa musik"}</li>
                  <li>• {pkg.has_video ? "Galeri video" : "Galeri foto"}</li>
                </ul>
              </div>
              <button
                type="submit"
                className="mt-5 rounded-lg bg-rosewood-ink px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-inverse-surface"
              >
                Pilih
              </button>
            </form>
          ))}
        </div>
      )}
    </main>
  );
}

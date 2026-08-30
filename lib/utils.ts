/**
 * Supabase PostgREST mengembalikan relasi embedded (mis. `package:packages(...)`)
 * kadang sebagai objek tunggal (many-to-one), kadang sebagai array.
 * Helper ini menormalisasikannya menjadi array tanpa kehilangan elemen.
 */
export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
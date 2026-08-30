const FALLBACK_NUMBER = "";

export function waNumber(): string {
  return process.env.NEXT_PUBLIC_WA_NUMBER?.trim() || FALLBACK_NUMBER;
}

export function waLink(message?: string): string {
  const number = waNumber();
  if (!number) return "https://wa.me/";
  const suffix = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${suffix}`;
}

export function waOrderMessage(themeName?: string): string {
  if (themeName) {
    return `Halo, saya ingin memesan tema ${themeName} untuk undangan pernikahan. Boleh dibantu?`;
  }
  return "Halo, saya ingin membuat undangan pernikahan digital dengan bantuan tim UndanganJo. Boleh dibantu?";
}

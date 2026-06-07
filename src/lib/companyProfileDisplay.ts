/** Display only domain for PDF/live view (e.g. nmsolux.com) */
export function getDisplayDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

/** Instagram: plain text handle (nvenm or @nvenm) or old URL → handle only */
export function getInstagramHandle(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('@')) return trimmed.slice(1);
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (u.hostname.includes('instagram.com')) {
        const path = u.pathname.replace(/\/$/, '').split('/').pop();
        return path ?? trimmed;
      }
    } catch {
      // ignore
    }
  }
  return trimmed;
}

/** Display text for Instagram: @handle */
export function getInstagramDisplay(value: string | null | undefined): string {
  const handle = getInstagramHandle(value);
  return handle ? `@${handle}` : '';
}

/** Full display line for Instagram: "IG: @nevenm" (plain text, no link) */
export function getInstagramDisplayLine(value: string | null | undefined): string {
  const display = getInstagramDisplay(value);
  return display ? `IG: ${display}` : '';
}

/** URL for Instagram from handle (plain text) */
export function getInstagramUrl(value: string | null | undefined): string {
  const handle = getInstagramHandle(value);
  return handle ? `https://instagram.com/${handle}` : '';
}

/** Facebook: plain text only (e.g. Neven Mulavdic), no link */
export function getFacebookDisplay(profile: { social_display_label?: string | null } | null | undefined): string {
  if (!profile) return '';
  return (profile.social_display_label ?? '').trim();
}

/** Full display line for Facebook: "FB: Neven Mulavdic" (plain text, no link) */
export function getFacebookDisplayLine(profile: { social_display_label?: string | null } | null | undefined): string {
  if (!profile) return '';
  const name = getFacebookDisplay(profile);
  return name ? `FB: ${name}` : '';
}

/** @deprecated Use getInstagramUrl + getInstagramDisplay / getFacebookDisplay */
export function getSocialUrl(value: string): string {
  return getInstagramUrl(value);
}

/** @deprecated Use getInstagramDisplay(profile.instagram_link) or getFacebookDisplay(profile) */
export function getSocialDisplayLabel(profile: { instagram_link?: string | null; social_display_label?: string | null }): string {
  return getInstagramDisplay(profile.instagram_link) || getFacebookDisplay(profile);
}

import { Linking } from 'react-native';

/**
 * Public URLs for Fasih's legal documents.
 *
 * ⚠️ BOTH MUST BE FILLED IN BEFORE STORE SUBMISSION.
 * Apple and Google each require a publicly reachable privacy policy URL for any
 * app that collects personal data — Fasih collects account details, learning
 * history and subscription state, so it will be rejected at review without one.
 *
 * These same URLs back the in-app links on the sign-up screen and in Profile →
 * Account. While a URL is empty its link is not rendered at all, rather than
 * shown as a control that does nothing when tapped.
 *
 * See docs/privacy-data-inventory.md for exactly what data the app collects —
 * that's the input a policy generator (or a lawyer) needs.
 */
export const LEGAL_URLS = {
  privacy: '',
  terms: '',
} as const;

export type LegalDoc = keyof typeof LEGAL_URLS;

/** True once this document's URL has been configured. */
export function isLegalUrlSet(doc: LegalDoc): boolean {
  return LEGAL_URLS[doc].length > 0;
}

/** Open a legal document in the device browser. No-op if the URL isn't set yet. */
export function openLegal(doc: LegalDoc): void {
  const url = LEGAL_URLS[doc];
  if (!url) return;
  void Linking.openURL(url);
}

if (__DEV__ && (!isLegalUrlSet('privacy') || !isLegalUrlSet('terms'))) {
  console.warn(
    '⚠️ LEGAL_URLS not configured in src/constants/legal.ts — the in-app Privacy Policy / Terms links are hidden. Both stores require a privacy policy URL before submission.',
  );
}

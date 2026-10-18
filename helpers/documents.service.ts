import { api } from './axios';
import type { DocumentEndpointEnum } from '@/enum';

/** How long a generated blob URL stays valid after the document tab has loaded it. */
const BLOB_URL_TTL_MS = 60_000;

/**
 * Opens a printable document in a new tab.
 *
 * Documents need the bearer token (they contain patient data), so a plain link no longer
 * works. The tab is opened synchronously to keep the browser's popup blocker happy, then
 * pointed at a short-lived blob URL once the authenticated request returns.
 */
export async function openDocument(endpoint: DocumentEndpointEnum, id: string): Promise<void> {
  const tab = window.open('', '_blank');
  if (tab) tab.document.title = 'Loading document…';
  try {
    const { data } = await api.get<string>(`${endpoint}/${id}`, { responseType: 'text' });
    const url = URL.createObjectURL(new Blob([data], { type: 'text/html' }));
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.location.assign(url);
    }
    window.setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_TTL_MS);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

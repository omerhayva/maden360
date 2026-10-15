import { buildSearchDocuments } from '@/lib/search/documents';

/** Arama dizini derleme sırasında statik JSON dosyası olarak üretilir (/arama-dizini.json). */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildSearchDocuments());
}

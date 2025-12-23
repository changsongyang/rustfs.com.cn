import { getLatestVersion } from '@/lib/github';
import DownloadPageClient from './components/download-page-client';

export default async function DownloadPage() {
  const release = await getLatestVersion();
  return <DownloadPageClient release={release} />;
}

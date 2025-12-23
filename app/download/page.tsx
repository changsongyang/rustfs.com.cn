import { getLatestVersion, getLatestLauncherRelease } from '@/lib/github';
import DownloadPageClient from './components/download-page-client';

export default async function DownloadPage() {
  const [release, launcherRelease] = await Promise.all([
    getLatestVersion(),
    getLatestLauncherRelease()
  ]);
  return <DownloadPageClient release={release} launcherRelease={launcherRelease} />;
}

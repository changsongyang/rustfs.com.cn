'use client'

import { getDownloadUrlForPlatform, type GitHubRelease } from '@/lib/github';
import { cn } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";
import CodeBlock from "../code-block";
import Note from "../common/note";
import PlatformHeader from "../common/platform-header";
import { type PlatformInfoData } from "./platform-info";

interface WindowsDownloadSectionProps {
  platform: PlatformInfoData;
  release: GitHubRelease | null;
  className?: string;
}

export default function WindowsDownloadSection({ platform, release, className }: WindowsDownloadSectionProps) {
  // Get download URLs from release assets or use fallback
  const x86_64Url = release
    ? getDownloadUrlForPlatform(release, 'windows', 'x86_64')
    : null;

  const fallbackX86_64Url = 'https://github.com/rustfs/rustfs/releases/latest';

  const finalX86_64Url = x86_64Url || fallbackX86_64Url;

  // Extract filename from URL for code block
  const getFilenameFromUrl = (url: string) => {
    if (url.includes('github.com')) {
      return 'rustfs-windows-x86_64.zip';
    }
    const match = url.match(/([^\/]+\.zip)/);
    return match ? match[1] : 'rustfs-windows-x86_64.zip';
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Platform Header */}
      <PlatformHeader platform={platform} />

      {/* Binary Downloads */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">{'二进制下载'}</h3>

        {/* x86_64 Variant */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">x86_64</h4>
              <p className="text-sm text-muted-foreground">
                {'架构'}: x86_64
              </p>
            </div>
            <a
              href={finalX86_64Url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <DownloadIcon className="w-4 h-4" />
              <span>{'下载'}</span>
            </a>
          </div>

          <CodeBlock
            code={[
              `curl -O ${finalX86_64Url}`,
              `Expand-Archive -Path ${getFilenameFromUrl(finalX86_64Url)} -DestinationPath .`,
              ".\\rustfs.exe --version",
            ]}
            title={'安装命令'}
          />

          <Note type="tip">
            {'默认凭据：rustfsadmin / rustfsadmin'}
          </Note>
        </div>
      </div>
    </div>
  );
}

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { SITE_CONFIG } from '@/app.config';

const BASE_URL = SITE_CONFIG.primaryDomain;
const OUT_DIR = 'out';
const SITEMAP_OUTPUT = 'out/sitemap.xml';

const PAGE_PRIORITIES: Record<string, number> = {
  '/': 1.0,
  '/download/': 0.9,
};

const PAGE_CHANGE_FREQ: Record<string, string> = {
  '/': 'weekly',
  '/download/': 'monthly',
};

export function scanDirectory(dirPath: string, basePath = ''): string[] {
  const urls: string[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        urls.push(...scanDirectory(fullPath, relativePath));
      } else if (item === 'index.html') {
        const urlPath = basePath === '' ? '/' : `/${basePath.replace(/\\/g, '/')}/`;
        urls.push(urlPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return urls;
}

function getPagePriority(url: string): number {
  return PAGE_PRIORITIES[url] ?? 0.5;
}

function getPageChangeFreq(url: string): string {
  return PAGE_CHANGE_FREQ[url] ?? 'monthly';
}

export function generateSitemap(urls: string[]): string {
  const now = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${getPageChangeFreq(url)}</changefreq>\n`;
    xml += `    <priority>${getPagePriority(url)}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return xml;
}

export function validateSitemap(sitemap: string): boolean {
  if (!sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('Missing XML declaration');
  }

  if (!sitemap.includes('<urlset')) {
    throw new Error('Missing urlset root element');
  }

  const urlCount = (sitemap.match(/<url>/g) || []).length;
  if (urlCount === 0) {
    throw new Error('No URLs found in sitemap');
  }

  return true;
}

export function main(): void {
  console.log('🔍 Scanning out directory for static files...');

  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ Out directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const urls = scanDirectory(OUT_DIR);

  if (urls.length === 0) {
    console.log('⚠️  No URLs found in out directory.');
    return;
  }

  console.log(`📝 Found ${urls.length} URLs:`);
  urls.forEach((url) => console.log(`   ${url}`));

  const sitemap = generateSitemap(urls);

  try {
    validateSitemap(sitemap);
    console.log('✅ Sitemap validation passed');
  } catch (error) {
    console.error('❌ Sitemap validation failed:', (error as Error).message);
    process.exit(1);
  }

  try {
    fs.writeFileSync(SITEMAP_OUTPUT, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully at ${SITEMAP_OUTPUT}`);
    console.log(`🌐 Sitemap URL: ${BASE_URL}/sitemap.xml`);
    console.log(`📊 Total URLs: ${urls.length}`);
    console.log(`🌍 Sitemap base URL: ${BASE_URL}`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main();
}


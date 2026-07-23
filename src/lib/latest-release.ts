const RELEASES_API = "https://api.github.com/repos/AnvilNote/anvilnote-desktop/releases/latest";

// Tag for this fetch's cache entry, so a release-publish webhook can force
// a refetch via revalidateTag() instead of waiting out the 1hr window below.
export const LATEST_RELEASE_TAG = "latest-release";

// Fallback used if the GitHub API is unreachable or rate-limited at build/
// request time — better to ship a slightly-stale known-good release than a
// broken download section.
const FALLBACK_VERSION = "0.1.17";
const FALLBACK_BASE = `https://github.com/AnvilNote/anvilnote-desktop/releases/download/v${FALLBACK_VERSION}`;
const FALLBACK_ASSETS = {
  macOS: `${FALLBACK_BASE}/AnvilNote-${FALLBACK_VERSION}-arm64.dmg`,
  windows: `${FALLBACK_BASE}/AnvilNote.Setup.${FALLBACK_VERSION}.exe`,
  linux: `${FALLBACK_BASE}/anvilnote_${FALLBACK_VERSION}_amd64.deb`,
};

type GitHubAsset = { name: string; browser_download_url: string };
type GitHubRelease = { tag_name: string; assets: GitHubAsset[] };

export type LatestDesktopRelease = {
  version: string;
  macOS: string | null;
  windows: string | null;
  linux: string | null;
};

function findAsset(assets: GitHubAsset[], matches: (name: string) => boolean) {
  return assets.find((asset) => matches(asset.name))?.browser_download_url ?? null;
}

export async function getLatestDesktopRelease(): Promise<LatestDesktopRelease> {
  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
      // Release cadence is slow — an hour of staleness is a fine trade for
      // not hammering the GitHub API on every request. The release-publish
      // webhook (see api/revalidate) forces an earlier refetch via this tag.
      next: { revalidate: 3600, tags: [LATEST_RELEASE_TAG] },
    });
    if (!response.ok) throw new Error(`GitHub API responded ${response.status}`);

    const release = (await response.json()) as GitHubRelease;
    const macOS = findAsset(release.assets, (name) => name.endsWith("-arm64.dmg"));
    const windows = findAsset(release.assets, (name) => name.endsWith(".exe"));
    const linux = findAsset(release.assets, (name) => name.endsWith("_amd64.deb"));
    return { version: release.tag_name.replace(/^v/, ""), macOS, windows, linux };
  } catch {
    return { version: FALLBACK_VERSION, ...FALLBACK_ASSETS };
  }
}

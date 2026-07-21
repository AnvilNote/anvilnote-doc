import { faApple, faWindows, faLinux } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function DownloadButtons({
  macOS,
  windows,
  linux,
  versionLabel,
}: {
  macOS: string;
  windows: string;
  linux: string;
  versionLabel: string;
}) {
  const platforms = [
    { name: "macOS", icon: faApple, href: macOS },
    { name: "Windows", icon: faWindows, href: windows },
    { name: "Linux", icon: faLinux, href: linux },
  ] as const;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 scale-100 items-center gap-2.5 rounded-full border border-border bg-background px-6 text-sm font-medium transition-all duration-200 ease-out hover:scale-105 hover:bg-foreground hover:text-background active:scale-100"
          >
            <FontAwesomeIcon icon={platform.icon} className="size-4" />
            {platform.name}
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{versionLabel}</p>
    </div>
  );
}

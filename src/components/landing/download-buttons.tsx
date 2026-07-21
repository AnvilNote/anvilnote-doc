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
      <div className="flex w-full flex-nowrap items-center justify-center gap-2 px-6 sm:w-auto sm:gap-3 sm:px-0">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 flex-1 scale-100 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ease-out hover:scale-105 hover:bg-foreground hover:text-background active:scale-100 sm:h-11 sm:flex-none sm:gap-2.5 sm:px-6 sm:text-sm"
          >
            <FontAwesomeIcon icon={platform.icon} className="size-3.5 sm:size-4" />
            {platform.name}
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{versionLabel}</p>
    </div>
  );
}

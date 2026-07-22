import { faApple, faWindows, faLinux } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fillRevealContentClass, fillRevealSurfaceClass } from "./fill-reveal";

export function DownloadButtons({
  macOS,
  windows,
  linux,
  versionLabel,
}: {
  macOS: string | null;
  windows: string | null;
  linux: string | null;
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
        {platforms.map((platform) => {
          const content = (
            <span className={`${fillRevealContentClass} flex items-center gap-1.5 sm:gap-2.5`}>
              <FontAwesomeIcon icon={platform.icon} className="size-3.5 sm:size-4" />
              {platform.name}
            </span>
          );
          const buttonClassName =
            "flex h-10 flex-1 scale-100 items-center justify-center rounded-full border border-border bg-background px-2 text-xs font-medium whitespace-nowrap transition-transform duration-200 ease-out sm:h-11 sm:flex-none sm:px-6 sm:text-sm";

          if (!platform.href) {
            return (
              <button
                key={platform.name}
                type="button"
                disabled
                className={`${buttonClassName} cursor-not-allowed opacity-45`}
              >
                {content}
              </button>
            );
          }

          return (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              className={`${fillRevealSurfaceClass} ${buttonClassName} hover:scale-105 active:scale-100`}
            >
              {content}
            </a>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{versionLabel}</p>
    </div>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
          Built by{" "}
          <Link
            href="https://turan.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors font-bold"
          >
            TURAN-YAHYA GAZIZULY
          </Link>
        </p>
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
          <span className="mr-1 ml-2">|</span>© {new Date().getFullYear()} All rights
          reserved.
        </p>
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-right flex-1">
          BOSSFORSKIY est.1953
        </p>
      </div>
    </div>
  );
}

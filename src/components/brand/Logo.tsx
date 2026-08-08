import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "wordmark" | "monogram";
  className?: string;
  title?: string;
};

export function Logo({
  variant = "wordmark",
  className,
  title = "LUCCI CRENO",
}: LogoProps) {
  if (variant === "monogram") {
    return (
      <svg
        viewBox="0 0 64 64"
        className={cn("text-current", className)}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M18 44V20h8.2c6.4 0 10.4 3.2 10.4 8.4 0 3.4-1.7 6-4.7 7.4L40 44h-7.2l-7-7.8H25.2V44H18zm7.2-13.6h1c2.6 0 4.1-1.3 4.1-3.5S28.8 23.4 26.2 23.4h-1v6.999zM42 20l8 12.4L58 20h-7.1l-3.4 5.7L44.1 20H42z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 420 56"
      className={cn("text-current", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <text
        x="0"
        y="40"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: 34,
          letterSpacing: "0.28em",
          fontWeight: 500,
        }}
      >
        LUCCI CRENO
      </text>
    </svg>
  );
}

export function LogoWordmarkPaths({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 80"
      className={cn("text-current", className)}
      role="img"
      aria-label="LUCCI CRENO"
    >
      <title>LUCCI CRENO</title>
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 62V18h18" />
        <path d="M48 18v44h22" />
        <path d="M88 62V18h26c14 0 22 8 22 22s-8 22-22 22H88z" />
        <path d="M154 18v44h18V40l20 22h20L186 36l24-18h-20l-18 14V18z" />
        <path d="M230 18v44h18V18z" />
        <path d="M274 62V18h42" />
        <path d="M334 18v44" />
        <path d="M358 62V18h26c14 0 22 8 22 22s-8 22-22 22h-26z" />
        <path d="M424 18v44h22c14 0 24-10 24-22S460 18 446 18h-22z" />
        <path d="M488 18v44" />
      </g>
    </svg>
  );
}

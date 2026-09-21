"use client";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: ShareButtonsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-4">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link-underline text-sm text-ink no-underline"
      >
        Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link-underline text-sm text-ink no-underline"
      >
        Facebook
      </a>
      <button
        type="button"
        className="link-underline text-sm text-ink"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            /* ignore */
          }
        }}
      >
        Copy link
      </button>
    </div>
  );
}

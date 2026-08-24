import { Wallet } from "lucide-react";

/**
 * Green branding panel shown on the left side of the auth screens
 * (sign in / sign up). Purely presentational and theme-independent —
 * it always renders the Wallet Watch brand on a deep-green field.
 */
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-teal-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Decorative concentric rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
      >
        <div className="absolute -top-40 -left-24 size-[36rem] rounded-full border border-white" />
        <div className="absolute top-1/3 left-1/2 size-[40rem] rounded-full border border-white" />
        <div className="absolute -bottom-48 -left-16 size-[32rem] rounded-full border border-white" />
      </div>

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[oklch(0.42_0.11_150)]">
          <Wallet className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Wallet Watch
        </span>
      </div>

      {/* Illustration */}
      <div className="relative flex flex-1 items-center justify-center py-10">
        <AuthIllustration />
      </div>

      {/* Tagline */}
      <div className="relative max-w-md">
        <h2 className="text-3xl leading-tight font-bold text-balance">
          See every peso move, the moment it happens.
        </h2>
        <p className="mt-3 text-sm text-white/70">
          Track income, expenses and transfers across all your accounts with
          real-time insights.
        </p>
      </div>
    </aside>
  );
}

function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm drop-shadow-xl"
      aria-hidden
    >
      {/* Back card */}
      <rect
        x="44"
        y="70"
        width="200"
        height="120"
        rx="14"
        fill="white"
        opacity="0.15"
      />
      {/* Speech-bubble card */}
      <g>
        <rect x="70" y="52" width="200" height="120" rx="14" fill="white" />
        <rect
          x="70"
          y="52"
          width="200"
          height="34"
          rx="14"
          fill="oklch(0.3669 0.0546 205.99)"
        />
        <rect
          x="70"
          y="72"
          width="200"
          height="14"
          fill="oklch(0.3669 0.0546 205.99)"
        />
        <circle cx="248" cy="69" r="7" fill="white" />
        {/* Body lines */}
        <rect
          x="88"
          y="104"
          width="150"
          height="10"
          rx="5"
          fill="oklch(0.42 0.11 150)"
          opacity="0.35"
        />
        <rect
          x="88"
          y="122"
          width="110"
          height="10"
          rx="5"
          fill="oklch(0.42 0.11 150)"
          opacity="0.2"
        />
        {/* Amount chip */}
        <rect
          x="88"
          y="142"
          width="66"
          height="20"
          rx="6"
          fill="oklch(0.3669 0.0546 205.99)"
        />
        <text
          x="98"
          y="156"
          fontSize="12"
          fontWeight="700"
          fill="white"
          fontFamily="sans-serif"
        >
          ₱ +
        </text>
        {/* Bubble tail */}
        <path d="M96 172 L96 200 L124 172 Z" fill="white" />
      </g>
    </svg>
  );
}

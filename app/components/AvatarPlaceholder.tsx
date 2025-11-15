import React from "react";

type AvatarProps = {
  size?: number;           // px, defaults to 80
  initials?: string | null;
  ariaLabel?: string;
  className?: string;
};

export default function AvatarPlaceholder({
  size = 80,
  initials = null,
  ariaLabel = "Profile placeholder",
  className = "",
}: AvatarProps) {
  const fontSize = Math.round(size * 0.34);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 80 80"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#9b8cff" />
          <stop offset="1" stopColor="#6ec1ff" />
        </linearGradient>
        <clipPath id="circleClip">
          <circle cx="40" cy="40" r="38" />
        </clipPath>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#g)" />

      <circle cx="28" cy="28" r="18" fill="white" opacity="0.06" />

      <g transform="translate(0,2)" fill="#ffffff" opacity="0.95">
        <circle cx="40" cy="28" r="12" />
        <path d="M18 60c0-9 12-16 22-16s22 7 22 16v2H18v-2z" />
      </g>

      {initials ? (
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight={700}
          fontSize={fontSize}
          fill="rgba(0,0,0,0.8)"
        >
          {initials.slice(0, 2).toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}

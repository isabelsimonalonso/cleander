export default function Logo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wrench (left, turquoise) */}
      <g transform="translate(-20, 20)">
        <rect x="40" y="60" width="70" height="18" rx="9" fill="#1da1b8" transform="rotate(-25 75 69)" />
        <circle cx="50" cy="50" r="18" fill="#1da1b8" />
      </g>

      {/* Mop (right, turquoise) */}
      <g transform="translate(20, -20)">
        <rect x="110" y="80" width="16" height="60" fill="#0d9488" />
        <circle cx="125" cy="145" r="22" fill="#0d9488" opacity="0.8" />
        <circle cx="115" cy="150" r="18" fill="#0d9488" opacity="0.7" />
        <circle cx="135" cy="150" r="18" fill="#0d9488" opacity="0.7" />
      </g>

      {/* Background circle for contrast */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="4" opacity="0.3" />
    </svg>
  )
}

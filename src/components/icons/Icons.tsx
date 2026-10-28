import type { ReactNode } from 'react'

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconLeaf() {
  return (
    <SvgIcon>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
    </SvgIcon>
  )
}

export function IconDollar() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M15 9.2c-.5-1-1.6-1.6-3-1.6-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.4 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.1-1.7M12 6v1.6M12 16.4V18" />
    </SvgIcon>
  )
}

export function IconSprout() {
  return (
    <SvgIcon>
      <path d="M12 21v-9" />
      <path d="M12 12c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6Z" />
      <path d="M12 10c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6Z" />
      <path d="M7 21h10" />
    </SvgIcon>
  )
}

export function IconBug() {
  return (
    <SvgIcon>
      <rect x="8" y="7" width="8" height="13" rx="4" />
      <path d="M9.5 7.5 8 4M14.5 7.5 16 4M12 11v9M8 12H4M16 12h4M8 16.5l-3.5 2M16 16.5l3.5 2M8 9 5 7M16 9l3-2" />
    </SvgIcon>
  )
}

export function IconMenu() {
  return (
    <SvgIcon>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </SvgIcon>
  )
}

export function IconClose() {
  return (
    <SvgIcon>
      <path d="M6 6l12 12M18 6 6 18" />
    </SvgIcon>
  )
}

export function IconTrend() {
  return (
    <SvgIcon>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </SvgIcon>
  )
}

export function IconShield() {
  return (
    <SvgIcon>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </SvgIcon>
  )
}

export function IconCalendar() {
  return (
    <SvgIcon>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4" />
    </SvgIcon>
  )
}

export function IconThermometer() {
  return (
    <SvgIcon>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 10v6" />
    </SvgIcon>
  )
}

export function IconRain() {
  return (
    <SvgIcon>
      <path d="M7 15a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.4 1.5A3.8 3.8 0 0 1 17.5 15H7Z" />
      <path d="M8 18.5 7 21M12 18.5 11 21M16 18.5 15 21" />
    </SvgIcon>
  )
}

export function IconDroplet() {
  return (
    <SvgIcon>
      <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z" />
    </SvgIcon>
  )
}

export function IconWind() {
  return (
    <SvgIcon>
      <path d="M3 8h10.5a2.5 2.5 0 1 0-2.5-2.5M3 12h16a2.5 2.5 0 1 1-2.5 2.5M3 16h8a2.5 2.5 0 1 1-2.5 2.5" />
    </SvgIcon>
  )
}

export function IconRefresh() {
  return (
    <SvgIcon>
      <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4" />
    </SvgIcon>
  )
}

export function IconSliders() {
  return (
    <SvgIcon>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </SvgIcon>
  )
}

export function IconGauge() {
  return (
    <SvgIcon>
      <path d="M3.5 16a8.5 8.5 0 1 1 17 0" />
      <path d="m12 16 4-5" />
      <circle cx="12" cy="16" r="1.2" />
    </SvgIcon>
  )
}

export function IconSparkles() {
  return (
    <SvgIcon>
      <path d="M10 3.5 11.6 8a2 2 0 0 0 1.3 1.3l4.6 1.7-4.6 1.6a2 2 0 0 0-1.3 1.3L10 18.5l-1.6-4.6a2 2 0 0 0-1.3-1.3L2.5 11l4.6-1.7A2 2 0 0 0 8.4 8L10 3.5Z" />
      <path d="M18 3v4M16 5h4M19 16v3M17.5 17.5h3" />
    </SvgIcon>
  )
}

export function IconPlay() {
  return (
    <SvgIcon>
      <path d="M7 4.5v15l12-7.5-12-7.5Z" />
    </SvgIcon>
  )
}

export function IconHistory() {
  return (
    <SvgIcon>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" />
      <path d="M3.5 4v4.5H8M12 7.5V12l3 2" />
    </SvgIcon>
  )
}

export function IconAlert() {
  return (
    <SvgIcon>
      <path d="M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4M12 17h.01" />
    </SvgIcon>
  )
}

export function IconInfo() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5.5M12 7.5h.01" />
    </SvgIcon>
  )
}

export function IconLogout() {
  return (
    <SvgIcon>
      <path d="M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5" />
      <path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9.5" />
    </SvgIcon>
  )
}

export function IconClipboard() {
  return (
    <SvgIcon>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 3h6v3H9zM12 10v6M9 13h6" />
    </SvgIcon>
  )
}

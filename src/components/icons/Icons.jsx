const PRIMARY_BLUE = "#2a7de1";

export function IconSearch({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeOpacity="0.75"
        strokeWidth="2"
      />
      <path
        d="M16.3 16.3 21 21"
        stroke="currentColor"
        strokeOpacity="0.75"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.5-9.2C1.2 8.3 3 5.6 6 5.2c1.7-.2 3.3.5 4.3 1.7C11.3 5.7 13 5 14.7 5.2c3 .4 4.8 3.1 3.5 6.1-2 4.6-9.5 9.2-9.5 9.2Z"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Z"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
      />
      <path
        d="M4.6 20.3c1.6-3.2 4.2-4.8 7.4-4.8s5.8 1.6 7.4 4.8"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8.5V7.2C7 4.9 8.8 3 11.2 3h1.6C15.2 3 17 4.9 17 7.2v1.3"
        stroke={PRIMARY_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.4 8.5h11.2c.9 0 1.7.7 1.8 1.6l.9 9.1c.1 1.1-.8 2-1.9 2H5.6c-1.1 0-2-.9-1.9-2l.9-9.1c.1-.9.9-1.6 1.8-1.6Z"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a2.4 2.4 0 0 0 2.4-2.4H9.6A2.4 2.4 0 0 0 12 22Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M18.5 10.7c0-3.6-2.2-6.4-6.5-6.4s-6.5 2.8-6.5 6.4c0 2.9-.8 4.2-1.7 5.2-.5.6-.1 1.6.7 1.6h15c.8 0 1.2-1 .7-1.6-.9-1-1.7-2.3-1.7-5.2Z"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 4.8c.6-1 1.6-1.6 2.8-1.6s2.2.6 2.8 1.6"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconCalendar({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5v3M17 3.5v3"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.5 8.2h15"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.2 5.7h11.6c1.5 0 2.7 1.2 2.7 2.7v11.4c0 1.5-1.2 2.7-2.7 2.7H6.2c-1.5 0-2.7-1.2-2.7-2.7V8.4c0-1.5 1.2-2.7 2.7-2.7Z"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h3M13 12h3M8 15.5h3M13 15.5h3"
        stroke="currentColor"
        strokeOpacity="0.75"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconChevronDown({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPhone({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.1 11.2c1.4 2.8 3.7 5 6.5 6.5l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.6.7 4 .7.6 0 1.1.5 1.1 1.1V21c0 .6-.5 1.1-1.1 1.1C11.7 22.1 1.9 12.3 1.9 0.9 1.9.3 2.4-.2 3-.2h3.9C7.5-.2 8 .3 8 1v2.6c0 .4-.1.8-.3 1.1L5.5 6.9l2.6 4.3Z"
        stroke={PRIMARY_BLUE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShieldThumb() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5 20 6v7.2c0 5-3.4 7.8-8 9.3-4.6-1.5-8-4.3-8-9.3V6l8-3.5Z"
        stroke="#2f7a4b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 12.3V9.6c0-.9.7-1.6 1.6-1.6h.7c.9 0 1.6.7 1.6 1.6v1.8h1.1c.9 0 1.6.7 1.6 1.6 0 .2 0 .4-.1.6l-1.1 4.1c-.2.7-.8 1.2-1.6 1.2H10.3c-.7 0-1.3-.6-1.3-1.3v-5.3h2Z"
        fill="#2f7a4b"
        fillOpacity="0.12"
        stroke="#2f7a4b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDrop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.8s6.5 7 6.5 12A6.5 6.5 0 0 1 12 21.3 6.5 6.5 0 0 1 5.5 14.8c0-5 6.5-12 6.5-12Z"
        stroke="#2f7a4b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 14.9c.5 2 2 3.4 4.1 3.7"
        stroke="#2f7a4b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconTear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8c4.5 0 7.5 8 12 8 2.8 0 4.6-2.6 4.6-5.2 0-2.9-2-5.8-6.6-5.8"
        stroke="#2f7a4b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 16c-4.5 0-7.5 8-12 8-2.8 0-4.6-2.6-4.6-5.2C3.4 16 5.4 13 10 13"
        stroke="#2f7a4b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconArrowRight({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m13 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBagSimple({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 9V7.3C7.5 5.5 9 4 10.8 4h2.4C15 4 16.5 5.5 16.5 7.3V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.7 9h10.6c.9 0 1.6.7 1.7 1.6l.8 8.5c.1 1-.7 1.9-1.8 1.9H6c-1 0-1.9-.9-1.8-1.9l.8-8.5c.1-.9.8-1.6 1.7-1.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPencil({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.6 4.6a2.1 2.1 0 0 0-3 0L3 15v5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5 17.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTruck({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 7.5h10v9h-10v-9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 10h4l2 2.5V16h-6v-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6.5 18.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="2" />
      <path d="M17.5 18.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCart({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 6.5h15l-1.6 7.5H8.2L6.5 6.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6.5 5.7 3.8H3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.8 17.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M18.1 17.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8.2 14h11.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconStar({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.8 14.7 8.6l6.3.6-4.7 4.1 1.4 6.2L12 16.8 6.3 19.5l1.4-6.2L3 9.2l6.3-.6L12 2.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconMail({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 7.5h15v10h-15v-10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m5 8 7 6 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLocation({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function IconWhatsapp({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11.6a8 8 0 0 1-11.8 7l-4 1.1 1.2-3.9A8 8 0 1 1 20 11.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.4c.2-.6.6-1 1.1-1 .3 0 .6.1.7.4l.8 1.9c.1.2.1.4 0 .6l-.5 1c.6 1 1.4 1.8 2.4 2.4l1-.5c.2-.1.4-.1.6 0l1.9.8c.3.1.4.4.4.7 0 .5-.4.9-1 1.1-.5.2-1.1.2-1.6 0-3-.9-5.4-3.3-6.3-6.3-.2-.5-.2-1.1 0-1.6Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
    </svg>
  );
}

export function IconSearchPlus({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16.3 16.3 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 7.5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 10.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconX({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

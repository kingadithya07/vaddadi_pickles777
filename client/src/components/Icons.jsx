const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icon = {
  Cart: (p) => (
    <svg {...base} {...p}>
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2.2l2.3 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H5.4" />
    </svg>
  ),
  User: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
  ),
  Pin: (p) => (
    <svg {...base} {...p}><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.7" /></svg>
  ),
  Box: (p) => (
    <svg {...base} {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>
  ),
  Chart: (p) => (
    <svg {...base} {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  ),
  Users: (p) => (
    <svg {...base} {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 5.2a3.2 3.2 0 0 1 0 6M18 20h3.5a5.6 5.6 0 0 0-3-4.9" /></svg>
  ),
  Plus: (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  Close: (p) => <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>,
  Check: (p) => <svg {...base} {...p}><path d="m20 6-11 11-5-5" /></svg>,
  Trash: (p) => (
    <svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></svg>
  ),
  Edit: (p) => (
    <svg {...base} {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
  ),
  Search: (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>,
  Menu: (p) => <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>,
  Star: (p) => (
    <svg {...base} fill="currentColor" stroke="none" {...p}>
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9Z" />
    </svg>
  ),
  Truck: (p) => (
    <svg {...base} {...p}><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" /><circle cx="7" cy="18.5" r="1.6" /><circle cx="17.5" cy="18.5" r="1.6" /></svg>
  ),
  Leaf: (p) => (
    <svg {...base} {...p}><path d="M4 20c0-9 6-14 16-14 0 10-5 15-13 15-1.5 0-3-.4-3-1Z" /><path d="M9 15c2-3 5-5 8-6" /></svg>
  ),
  Logout: (p) => (
    <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
  ),
  Home: (p) => <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>,
  Shield: (p) => <svg {...base} {...p}><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>,
};

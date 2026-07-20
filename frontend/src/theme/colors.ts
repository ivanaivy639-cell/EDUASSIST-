// ── Flat keys (used by existing screens & components) ─────────────────
export const colors = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  accent: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F97316',
  info: '#06B6D4',
  background: '#FFFFFF',          // used as ColorValue by existing code
  backgroundSecondary: '#F8FAFC',
  border: '#E5E7EB',              // used as ColorValue by existing code
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',

  // ── Scaled palettes (used by classe components) ──────────────────────
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  danger: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
  warn: {
    600: '#D97706',
  },
  secondary: {
    100: '#D1FAE5',
    500: '#10B981',
    700: '#047857',
  },
  text: {
    light: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  },
  // Namespaced to avoid conflicting with the flat `background` / `border` strings above
  bg: {
    cardLight: '#FFFFFF',
    inputLight: '#F9FAFB',
  },
  borders: {
    light: '#E5E7EB',
  },
} as const;

export const darkColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  accent: '#FBBF24',
  success: '#34D399',
  error: '#F87171',
  warning: '#FB923C',
  info: '#22D3EE',
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  border: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
} as const;

export type ColorTheme = typeof colors | typeof darkColors;

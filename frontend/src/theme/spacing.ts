// Numeric scale used by the classe components (spacing[1], spacing[4], etc.)
export const spacing: Record<number | string, number> = {
  // Named keys (used by existing code)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  // Numeric keys (used by new classe components)
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  16: 64,
} as const;

export type Spacing = keyof typeof spacing;

export const shadows = {
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const borderRadius: Record<string, number> = {
  sm: 8,
  md: 12,
  base: 8,
  lg: 14,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

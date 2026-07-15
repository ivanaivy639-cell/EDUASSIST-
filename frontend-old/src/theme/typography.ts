export const typography = {
  size: {
    hero: 32,
    title: 24,
    subtitle: 20,
    body: 16,
    small: 14,
    caption: 12,
  } as const,
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  } as const,
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  } as const,
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  } as const,
} as const;

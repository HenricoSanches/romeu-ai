// ─── Romeu AI Design System ───────────────────────────────────────────────────
// A sophisticated dark fintech palette — deep navy meets vibrant violet

export const Colors = {
  // Brand
  primary: '#7C3AED',          // vibrant violet (Romeu brand)
  primaryLight: '#A78BFA',     // lighter violet for accents
  primaryDark: '#5B21B6',      // deeper violet for pressed states
  primaryGhost: '#7C3AED22',   // ghost background

  // Background layers
  bgBase: '#0A0A14',           // deepest background
  bgSurface: '#12121F',        // card/bubble surfaces
  bgElevated: '#1A1A2E',       // elevated elements

  // Borders
  border: '#2A2A40',
  borderLight: '#3A3A55',

  // Text
  textPrimary: '#F0F0FF',      // near-white with a hint of violet
  textSecondary: '#9090BB',    // muted secondary
  textMuted: '#5A5A80',        // very muted

  // Chat bubbles
  bubbleUser: '#7C3AED',       // user messages → brand violet
  bubbleRomeu: '#1E1E35',      // Romeu messages → dark surface

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  income: '#10B981',           // green for income
  expense: '#F87171',          // soft red for expense

  // Input
  inputBg: '#1A1A2E',
  inputBorder: '#3A3A55',
  inputFocus: '#7C3AED',

  // White / transparency
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)',
};

export const Typography = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 17,
  fontSizeXL: 20,
  fontSizeXXL: 28,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};

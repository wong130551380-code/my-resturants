import { Platform } from 'react-native';

// ─── Spacing Scale ───────────────────────────────────────────────────────────
// Consistent 4px base spacing scale
export const Spacing = {
  zero: 0,
  half: 2,
  one: 4,
  oneHalf: 6,
  two: 8,
  twoHalf: 10,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  ten: 40,
  twelve: 48,
  sixteen: 64,
  twenty: 80,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const Radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const MaxContentWidth = 1200;
export const BottomTabInset = 60;
export const SidebarWidth = 260;
export const HeaderHeight = 64;

// ─── Typography ──────────────────────────────────────────────────────────────
export const Typography = {
  displayLarge: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  headingLarge: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headingMedium: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headingSmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  code: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    letterSpacing: 0,
  },
} as const;

// ─── Colors ──────────────────────────────────────────────────────────────────
const brandPalette = {
  // Primary - warm amber/gold for restaurant feel
  primary50: '#FFF8E1',
  primary100: '#FFECB3',
  primary200: '#FFE082',
  primary300: '#FFD54F',
  primary400: '#FFCA28',
  primary500: '#FFC107',
  primary600: '#FFB300',
  primary700: '#FFA000',
  primary800: '#FF8F00',
  primary900: '#FF6F00',

  // Accent - deep teal
  accent50: '#E0F2F1',
  accent100: '#B2DFDB',
  accent200: '#80CBC4',
  accent300: '#4DB6AC',
  accent400: '#26A69A',
  accent500: '#009688',
  accent600: '#00897B',
  accent700: '#00796B',
  accent800: '#00695C',
  accent900: '#004D40',

  // Neutrals
  neutral0: '#FFFFFF',
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral850: '#303030',
  neutral900: '#212121',
  neutral950: '#121212',

  // Semantic
  success50: '#E8F5E9',
  success100: '#C8E6C9',
  success500: '#4CAF50',
  success600: '#43A047',
  success700: '#388E3C',

  warning50: '#FFF3E0',
  warning100: '#FFE0B2',
  warning500: '#FF9800',
  warning600: '#FB8C00',
  warning700: '#F57C00',

  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error500: '#F44336',
  error600: '#E53935',
  error700: '#D32F2F',

  info50: '#E3F2FD',
  info100: '#BBDEFB',
  info500: '#2196F3',
  info600: '#1E88E5',
  info700: '#1976D2',
} as const;

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  textLink: string;

  // Brand
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySubtle: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;

  // Borders
  border: string;
  borderSubtle: string;
  borderStrong: string;
  borderFocus: string;

  // Semantic states
  success: string;
  successSubtle: string;
  successText: string;
  warning: string;
  warningSubtle: string;
  warningText: string;
  error: string;
  errorSubtle: string;
  errorText: string;
  info: string;
  infoSubtle: string;
  infoText: string;

  // Special
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  divider: string;

  // Specific
  tabBar: string;
  header: string;
  card: string;
  input: string;
  inputBorder: string;
  inputFocus: string;
}

export const lightColors: ThemeColors = {
  background: brandPalette.neutral50,
  backgroundSecondary: brandPalette.neutral100,
  backgroundTertiary: brandPalette.neutral200,
  surface: brandPalette.neutral0,
  surfaceHover: brandPalette.neutral50,
  surfaceActive: brandPalette.neutral100,
  surfaceElevated: brandPalette.neutral0,

  textPrimary: brandPalette.neutral900,
  textSecondary: brandPalette.neutral600,
  textTertiary: brandPalette.neutral500,
  textDisabled: brandPalette.neutral400,
  textInverse: brandPalette.neutral0,
  textLink: brandPalette.accent700,

  primary: brandPalette.primary600,
  primaryHover: brandPalette.primary700,
  primaryActive: brandPalette.primary800,
  primarySubtle: brandPalette.primary50,
  accent: brandPalette.accent600,
  accentHover: brandPalette.accent700,
  accentSubtle: brandPalette.accent50,

  border: brandPalette.neutral300,
  borderSubtle: brandPalette.neutral200,
  borderStrong: brandPalette.neutral400,
  borderFocus: brandPalette.accent500,

  success: brandPalette.success500,
  successSubtle: brandPalette.success50,
  successText: brandPalette.success700,
  warning: brandPalette.warning500,
  warningSubtle: brandPalette.warning50,
  warningText: brandPalette.warning700,
  error: brandPalette.error500,
  errorSubtle: brandPalette.error50,
  errorText: brandPalette.error700,
  info: brandPalette.info500,
  infoSubtle: brandPalette.info50,
  infoText: brandPalette.info700,

  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: brandPalette.neutral200,
  skeletonHighlight: brandPalette.neutral100,
  divider: brandPalette.neutral200,

  tabBar: brandPalette.neutral0,
  header: brandPalette.neutral0,
  card: brandPalette.neutral0,
  input: brandPalette.neutral0,
  inputBorder: brandPalette.neutral300,
  inputFocus: brandPalette.accent500,
};

export const darkColors: ThemeColors = {
  background: brandPalette.neutral950,
  backgroundSecondary: brandPalette.neutral900,
  backgroundTertiary: brandPalette.neutral850,
  surface: brandPalette.neutral900,
  surfaceHover: brandPalette.neutral850,
  surfaceActive: brandPalette.neutral800,
  surfaceElevated: brandPalette.neutral850,

  textPrimary: brandPalette.neutral50,
  textSecondary: brandPalette.neutral400,
  textTertiary: brandPalette.neutral500,
  textDisabled: brandPalette.neutral600,
  textInverse: brandPalette.neutral900,
  textLink: brandPalette.accent300,

  primary: brandPalette.primary500,
  primaryHover: brandPalette.primary400,
  primaryActive: brandPalette.primary300,
  primarySubtle: 'rgba(255, 193, 7, 0.12)',
  accent: brandPalette.accent400,
  accentHover: brandPalette.accent300,
  accentSubtle: 'rgba(0, 150, 136, 0.12)',

  border: brandPalette.neutral700,
  borderSubtle: brandPalette.neutral800,
  borderStrong: brandPalette.neutral600,
  borderFocus: brandPalette.accent400,

  success: brandPalette.success500,
  successSubtle: 'rgba(76, 175, 80, 0.12)',
  successText: '#81C784',
  warning: brandPalette.warning500,
  warningSubtle: 'rgba(255, 152, 0, 0.12)',
  warningText: '#FFB74D',
  error: brandPalette.error500,
  errorSubtle: 'rgba(244, 67, 54, 0.12)',
  errorText: '#E57373',
  info: brandPalette.info500,
  infoSubtle: 'rgba(33, 150, 243, 0.12)',
  infoText: '#64B5F6',

  overlay: 'rgba(0, 0, 0, 0.7)',
  skeleton: brandPalette.neutral800,
  skeletonHighlight: brandPalette.neutral700,
  divider: brandPalette.neutral800,

  tabBar: brandPalette.neutral900,
  header: brandPalette.neutral900,
  card: brandPalette.neutral900,
  input: brandPalette.neutral850,
  inputBorder: brandPalette.neutral700,
  inputFocus: brandPalette.accent400,
};

// ─── Shadows / Elevation ─────────────────────────────────────────────────────
export const Elevation = {
  none: {
    boxShadow: 'none',
  },
  xs: {
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  sm: {
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  md: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  lg: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
  },
  xl: {
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
} as const;

// ─── Theme Context ───────────────────────────────────────────────────────────
export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export type ThemeTokens = {
  colors: ThemeColors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  typography: typeof Typography;
  elevation: typeof Elevation;
};

export function getTheme(scheme: ColorScheme): ThemeTokens {
  return {
    colors: getColors(scheme),
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    elevation: Elevation,
  };
}

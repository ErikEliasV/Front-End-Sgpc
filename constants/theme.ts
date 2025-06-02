export const theme = {
  colors: {
    primary: '#3B82F6',       // Blue
    primaryLight: '#93C5FD',  // Light Blue
    secondary: '#8B5CF6',     // Purple
    accent: '#F59E0B',        // Amber
    success: '#10B981',       // Green
    warning: '#F59E0B',       // Amber
    error: '#EF4444',         // Red
    background: '#FFFFFF',    // White
    card: '#FFFFFF',          // White
    text: '#1F2937',          // Dark Gray
    textSecondary: '#6B7280', // Medium Gray
    border: '#E5E7EB',        // Light Gray
    inputBackground: '#F9FAFB', // Very Light Gray
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cybersecurity Color Scheme
        'cyber': {
          'dark-bg': '#0f172a',
          'dark-secondary': '#1e293b',
          'light-bg': '#f9fafb',
          'severity-low': '#22c55e',
          'severity-medium': '#facc15',
          'severity-high': '#fb923c',
          'severity-critical': '#ef4444',
          'gradient-start': '#3b82f6',
          'gradient-end': '#8b5cf6',
        },
        'primary': '#2563EB',
        'warning': '#FBBF24',
        'high': '#FB923C',
        'critical': '#EF4444',
        'success': '#22C55E',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(59, 130, 246, 0.3)',
        'cyber-lg': '0 0 30px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [],
}

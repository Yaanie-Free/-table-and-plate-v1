/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // ensures we can toggle or auto-detect dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand color
        primary: '#DC2626',

        // Dynamic theme tokens from your CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        'in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      // Custom breakpoints for comprehensive device support
      screens: {
        'xs': '375px',      // Small phones
        'sm': '640px',      // Large phones / small tablets
        'md': '768px',      // Tablets
        'lg': '1024px',     // Laptops / small desktops
        'xl': '1280px',     // Desktops
        '2xl': '1440px',    // Large desktops
        '3xl': '1920px',    // Dual monitors / ultrawide
        '4xl': '2560px',    // Large ultrawide
        // Custom device-specific breakpoints
        'mobile-sm': '320px',
        'mobile': '375px',
        'mobile-lg': '425px',
        'tablet': '768px',
        'tablet-lg': '1024px',
        'laptop': '1280px',
        'desktop': '1440px',
        'desktop-lg': '1920px',
        'ultrawide': '2560px',
      },
      // Fluid spacing that matches CSS variables
      spacing: {
        'fluid-1': 'var(--space-1)',
        'fluid-2': 'var(--space-2)',
        'fluid-3': 'var(--space-3)',
        'fluid-4': 'var(--space-4)',
        'fluid-6': 'var(--space-6)',
        'fluid-8': 'var(--space-8)',
        'fluid-12': 'var(--space-12)',
        'fluid-16': 'var(--space-16)',
      },
      // Fluid font sizes
      fontSize: {
        'fluid-xs': 'var(--text-xs)',
        'fluid-sm': 'var(--text-sm)',
        'fluid-base': 'var(--text-base)',
        'fluid-lg': 'var(--text-lg)',
        'fluid-xl': 'var(--text-xl)',
        'fluid-2xl': 'var(--text-2xl)',
        'fluid-3xl': 'var(--text-3xl)',
        'fluid-4xl': 'var(--text-4xl)',
        'fluid-5xl': 'var(--text-5xl)',
      },
      // Max widths for different screen sizes
      maxWidth: {
        'mobile': '425px',
        'tablet': '768px',
        'laptop': '1280px',
        'desktop': '1440px',
        'desktop-lg': '1800px',
        'ultrawide': '2400px',
      },
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [
    // Optional: hide scrollbar utilities if you’re using custom scroll
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
  ],
};

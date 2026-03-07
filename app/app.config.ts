export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      secondary: "red",
      neutral: "slate",
    },
    // Configure UCard component for light theme
    card: {
      base: "overflow-hidden shadow-sm rounded-lg bg-white",
      divide: "divide-y divide-[--ui-border]",
      ring: "ring-1 ring-[--ui-border]",
      header: {
        base: "px-4 py-5 sm:px-6 bg-white",
        padding: "px-4 py-5 sm:px-6",
      },
      body: {
        base: "px-4 py-5 sm:px-6 bg-white",
        padding: "px-4 py-5 sm:px-6",
      },
      footer: {
        base: "px-4 py-4 sm:px-6 bg-white border-t border-[--ui-border]",
        padding: "px-4 py-4 sm:px-6",
      },
    },
    // Override default dark colors
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
  },
});

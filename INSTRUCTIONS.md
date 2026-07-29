<!-- Scaffold your project -->

-npx create-next-app@latest
-tsconfig.json -> open in integrated terminal -> npx shadcn@latest
-cleanup your Project
-Navbar

<!-- Shadcn Dark Mode -->

-npm install next-themes
-go to Create a theme provider
-copy and paste to new file component/theme-provider.tsx
-go Wrap your root layout then copy suppressHydrationWarning
-layout.tsx <html suppressHydrationWarning>
-ThemeProvider
-Go to Add a mode toggle copy the code create component/ModeToggle.tsx

<!-- Authentication Function -->

-npm install next-auth @auth/prisma-adapter

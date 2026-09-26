import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata = {
  title: "ScreenSphere",
  description: "Watch movies and TV shows",
  icons: {
    icon: "public/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
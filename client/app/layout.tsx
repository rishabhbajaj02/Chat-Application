import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "Chat App",
  description: "Real-time chat application with AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

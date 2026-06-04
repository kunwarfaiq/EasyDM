import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EasyDM — Instagram DM Automation Suite",
  description:
    "Automate your Instagram DMs with visual workflows. Capture leads, automate support, and drive sales via smart messaging automation.",
  keywords: [
    "Instagram DM automation",
    "chatbot builder",
    "lead generation",
    "social media automation",
    "workflow builder",
  ],
  openGraph: {
    title: "EasyDM — Instagram DM Automation Suite",
    description: "Automate your Instagram DMs with visual workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

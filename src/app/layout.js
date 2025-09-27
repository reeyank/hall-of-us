import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CedarProvider from "./components/CedarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hall of Us - CedarOS Demo",
  description: "AI-native application built with CedarOS and Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CedarProvider>
          {children}
        </CedarProvider>
      </body>
    </html>
  );
}

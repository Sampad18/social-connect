import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Connect - Find Your Community",
  description: "An AI-powered platform to help socially isolated individuals find community events and activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

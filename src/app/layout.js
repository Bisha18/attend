import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "FluidPrecision GPS",
  description: "Enterprise Attendance Intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.variable} ${inter.variable} font-body bg-background text-on-surface min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

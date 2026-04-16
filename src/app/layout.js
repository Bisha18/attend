import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Attendsure GPS",
  description: "Enterprise Attendance Intelligence with Neobrutalism",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light overflow-x-hidden">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceGrotesk.className} min-h-screen text-on-surface overflow-x-hidden selection:bg-tertiary selection:text-black`}>
        {children}
      </body>
    </html>
  );
}

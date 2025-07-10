import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cherish ",
  description: "Created with Cherish ",
  generator: "Cherish ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

        <script
          src="https://upload-widget.cloudinary.com/global/all.js"
          type="text/javascript"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

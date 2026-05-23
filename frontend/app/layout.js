import "./globals.css";

export const metadata = {
  title: "Team Task Manager",
  description: "Full-stack team task manager with role-based access",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

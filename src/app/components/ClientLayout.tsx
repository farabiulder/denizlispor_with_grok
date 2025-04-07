"use client";

import { AuthProvider } from "../context/AuthProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body>
      <AuthProvider>{children}</AuthProvider>
    </body>
  );
}

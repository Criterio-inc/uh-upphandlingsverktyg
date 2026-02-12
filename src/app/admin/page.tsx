"use client";

import dynamic from "next/dynamic";

// Lazy-load the entire admin content so useUser only runs inside ClerkProvider
const AdminContent = dynamic(() => import("./admin-content"), { ssr: false });

export default function AdminPage() {
  return <AdminContent />;
}

import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = {
  title: "Private workspace | Aditya",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

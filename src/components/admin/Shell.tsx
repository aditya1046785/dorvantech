import Link from "next/link";
import { logout } from "@/app/aditya/actions";
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <Link href="/aditya" className="adm-brand">
          A<span>Private workspace</span>
        </Link>
        <nav>
          <Link href="/aditya">Overview</Link>
          <Link href="/aditya#projects">Projects</Link>
          <Link href="/aditya/security">Security</Link>
          <a href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
        </nav>
        <form action={logout}>
          <button>Sign out</button>
        </form>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

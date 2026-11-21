import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shell } from "@/components/admin/Shell";
import { PasswordForm } from "@/components/admin/Forms";
import { revokeSessions } from "../actions";
export default async function Security() {
  await requireOwner();
  const count = await db.session.count({
    where: {
      expiresAt: { gt: new Date() },
      lastSeen: { gt: new Date(new Date().getTime() - 1800000) },
    },
  });
  return (
    <Shell>
      <h1>Security</h1>
      <section className="adm-glass">
        <h2>Change password</h2>
        <PasswordForm />
      </section>
      <section className="adm-glass">
        <h2>Sessions</h2>
        <p>{count} active session(s). Two-factor authentication is enabled.</p>
        <form action={revokeSessions}>
          <button className="adm-primary">Sign out all devices</button>
        </form>
        <p>
          To reset your authenticator, use the private owner setup command on
          the server. It revokes all sessions.
        </p>
      </section>
    </Shell>
  );
}

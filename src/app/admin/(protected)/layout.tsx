import { Header } from "@/components/Header";
import { requireSession } from "@/auth/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <><Header admin/><main className="admin-shell"><div className="shell">{children}</div></main></>;
}

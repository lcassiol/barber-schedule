import { redirect } from "next/navigation";
import { currentSession } from "@/auth/session";
import { Header } from "@/components/Header";

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await currentSession()) redirect("/admin");
  const { erro } = await searchParams;
  return <><Header/><main className="shell hero"><div><span className="eyebrow">Área reservada</span><h1 className="display">Entre na<br/>oficina.</h1><p className="lede">Acesso exclusivo para administrar horários e clientes.</p><div className="demo-access"><span>Acesso local de demonstração</span><dl><div><dt>Usuário</dt><dd><code>admin</code></dd></div><div><dt>Senha</dt><dd><code>local-admin-password-not-for-production</code></dd></div></dl><small>Troque essas credenciais antes de publicar o sistema.</small></div></div><form className="card login-card" action="/api/auth/login" method="post">{erro && <p className="notice error" role="alert">Usuário ou senha inválidos.</p>}<div className="field"><label htmlFor="username">Usuário</label><input id="username" name="username" autoComplete="username" defaultValue="admin" required/></div><div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required/></div><button className="button">Entrar no painel</button></form></main></>;
}

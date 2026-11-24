import Link from "next/link";

export function Header({ admin = false }: { admin?: boolean }) {
  return <header className="masthead"><div className="shell"><Link className="brand" href={admin ? "/admin" : "/"}><span className="brand-mark" aria-hidden="true"/><strong>Ofício Barber</strong></Link><nav className="nav" aria-label="Navegação principal">{admin ? <><Link href="/admin">Agenda</Link><Link href="/admin/horarios">Horários</Link><Link href="/admin/sair" prefetch={false}>Sair</Link></> : <Link href="/admin/login">Área do barbeiro</Link>}</nav></div></header>;
}

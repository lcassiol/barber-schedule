import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return <><Header/><main className="shell hero"><div><span className="eyebrow">Corte preciso. Horário respeitado.</span><h1 className="display">Seu estilo,<br/>sem espera.</h1><p className="lede">Escolha um horário de uma hora e chegue com a cadeira pronta para você.</p><Link className="button" href="/agenda/oficio-barber">Ver agenda</Link></div><aside className="card"><span className="eyebrow">Atendimento</span><h2>Na régua, no seu tempo.</h2><p className="muted">Cortes clássicos, barba e acabamento. Na reserva, conte o que você tem em mente.</p></aside></main><footer className="footer"><div className="shell">Ofício Barber · Atendimento com hora marcada</div></footer></>;
}

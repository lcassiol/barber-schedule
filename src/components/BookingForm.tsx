"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function BookingForm({ slug, selected, timezone, onClearSelection }: { slug: string; selected?: string; timezone: string; onClearSelection: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(undefined);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch(`/api/public/${slug}/appointments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const body = await response.json();
    if (!response.ok) { setMessage(body.error ?? "Não foi possível reservar. Escolha outro horário."); return; }
    form.reset();
    const search = new URLSearchParams(window.location.search);
    search.delete("slot"); search.set("booked", "1");
    startTransition(() => router.replace(`/agenda/${slug}?${search}`));
  }
  const formatted = selected ? new Intl.DateTimeFormat("pt-BR", { timeZone: timezone, weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(selected)) : undefined;
  return <aside className="booking-sidebar"><div className="booking-sidebar-head"><span className="section-label">03 · Seus dados</span><h2>Finalize sua reserva</h2><p>Preencha os dados abaixo para confirmar.</p></div>{selected ? <div className="selected-time"><span>Horário escolhido</span><strong>{formatted}</strong><button type="button" onClick={onClearSelection}>Trocar horário</button></div> : <div className="selected-time empty"><span>Horário escolhido</span><strong>Nenhum horário selecionado</strong><small>Selecione uma opção ao lado para continuar.</small></div>}<form className="booking-form" onSubmit={submit}>{message && <p className="form-message error" role="status">{message}</p>}{selected && <input name="start" type="hidden" value={selected}/>}<div className="field"><label htmlFor="name">Seu nome</label><input id="name" name="name" minLength={2} maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" required/></div><div className="field"><label htmlFor="phone">WhatsApp ou telefone</label><input id="phone" name="phone" type="tel" minLength={8} maxLength={30} autoComplete="tel" placeholder="(00) 00000-0000" required/></div><div className="field"><label htmlFor="notes">O que você gostaria? <span>(opcional)</span></label><textarea id="notes" name="notes" maxLength={500} rows={4} placeholder="Ex.: degradê baixo, barba desenhada..."/></div><button className="booking-submit" disabled={pending || !selected}>{pending ? "Confirmando..." : "Confirmar reserva"}<span>→</span></button><p className="privacy-note">Ao confirmar, seus dados ficam visíveis apenas para o barbeiro.</p></form></aside>;
}

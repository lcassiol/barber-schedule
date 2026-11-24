import { notFound } from "next/navigation";
import { DateTime } from "luxon";
import { Header } from "@/components/Header";
import { BookingExperience } from "@/components/BookingExperience";
import { getAvailability } from "@/services/booking";

export default async function PublicSchedule({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ date?: string; slot?: string; booked?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const date = query.date ?? DateTime.now().toISODate()!;
  const data = await getAvailability(slug, date);
  if (!data) notFound();
  const selectedDate = DateTime.fromISO(date, { zone: data.barber.timezone }).setLocale("pt-BR");
  const previous = selectedDate.minus({ days: 1 }).toISODate()!;
  const next = selectedDate.plus({ days: 1 }).toISODate()!;
  return <><Header/><main className="public-schedule"><section className="schedule-hero"><div className="shell schedule-hero-inner"><div><span className="schedule-kicker"><i/> Agenda online</span><h1>Seu próximo corte,<br/><em>no seu tempo.</em></h1><p>Escolha um horário livre e confirme em menos de um minuto.</p></div><div className="schedule-trust"><span>Atendimento com hora marcada</span><span>Seus dados ficam privados</span><span>Reserva sem cadastro</span></div></div></section><div className="shell schedule-content">{query.booked && <div className="booking-success" role="status"><span>✓</span><div><strong>Horário confirmado</strong><p>Sua cadeira está reservada. Até lá!</p></div></div>}<BookingExperience slug={slug} date={date} dateLabel={selectedDate.toFormat("cccc, dd 'de' LLLL")} previousDate={previous} nextDate={next} timezone={data.barber.timezone} slots={data.slots} initialSelected={query.slot}/></div></main></>;
}

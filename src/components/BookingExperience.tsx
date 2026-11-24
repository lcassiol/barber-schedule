"use client";

import { useState } from "react";
import { BookingForm } from "@/components/BookingForm";

type Slot = {
  start: string;
  state: "available" | "occupied" | "unavailable";
};

type BookingExperienceProps = {
  slug: string;
  date: string;
  dateLabel: string;
  previousDate: string;
  nextDate: string;
  timezone: string;
  slots: Slot[];
  initialSelected?: string;
};

function formatTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function BookingExperience({
  slug,
  date,
  dateLabel,
  previousDate,
  nextDate,
  timezone,
  slots,
  initialSelected,
}: BookingExperienceProps) {
  const validInitialSelection = slots.some(
    (slot) => slot.start === initialSelected && slot.state === "available",
  )
    ? initialSelected
    : undefined;
  const [selected, setSelected] = useState(validInitialSelection);
  const availableCount = slots.filter((slot) => slot.state === "available").length;

  function updateSelection(value?: string) {
    setSelected(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("slot", value);
    else url.searchParams.delete("slot");
    window.history.replaceState(window.history.state, "", url);
  }

  return <div className="schedule-grid"><section className="schedule-panel" aria-labelledby="slots-title"><div className="schedule-panel-head"><div><span className="section-label">01 · Escolha o dia</span><h2>{dateLabel}</h2></div><div className="day-arrows"><a href={`?date=${previousDate}`} aria-label="Dia anterior">←</a><a href={`?date=${nextDate}`} aria-label="Próximo dia">→</a></div></div><form className="date-picker"><label htmlFor="date">Ir para outra data</label><div><input id="date" name="date" type="date" defaultValue={date}/><button type="submit">Ver agenda</button></div></form><div className="slots-heading"><div><span className="section-label">02 · Escolha o horário</span><h2 id="slots-title">Horários disponíveis</h2></div><span className="availability-count">{availableCount} {availableCount === 1 ? "horário livre" : "horários livres"}</span></div>{slots.length ? <div className="modern-slot-grid">{slots.map((slot) => { const label = slot.state === "available" ? "Livre" : slot.state === "occupied" ? "Ocupado" : "Indisponível"; const content = <><span className="slot-time">{formatTime(slot.start, timezone)}</span><span className="slot-state"><i/>{label}</span></>; return slot.state === "available" ? <button type="button" onClick={() => updateSelection(slot.start)} className={`modern-slot ${selected === slot.start ? "selected" : ""}`} key={slot.start} aria-pressed={selected === slot.start} aria-label={`Selecionar ${formatTime(slot.start, timezone)}`}>{content}<span className="slot-arrow">↗</span></button> : <div className={`modern-slot ${slot.state}`} key={slot.start} aria-label={`${formatTime(slot.start, timezone)} ${label}`}>{content}</div>; })}</div> : <div className="empty-schedule"><span>—</span><h3>Sem expediente neste dia</h3><p>Escolha outra data para encontrar os próximos horários.</p></div>}</section><BookingForm slug={slug} selected={selected} timezone={timezone} onClearSelection={() => updateSelection()}/></div>;
}

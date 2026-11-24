import { z } from "zod";

export const appointmentInput = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(100),
  phone: z.string().trim().min(8, "Informe o telefone").max(30),
  notes: z.string().trim().max(500).optional().transform((value) => value || undefined),
  start: z.iso.datetime({ offset: true }),
});

export type AppointmentInput = z.infer<typeof appointmentInput>;

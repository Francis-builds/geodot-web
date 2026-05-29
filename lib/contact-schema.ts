import { z } from "zod";

export const contactSchema = z.object({
  nombre: z.string().min(2).max(80),
  empresa: z.string().min(2).max(120),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
  industria: z.string().max(60).optional().or(z.literal("")),
  mensaje: z.string().min(10).max(2000),
  website: z.literal(""), // honeypot: must be empty
});

export type ContactInput = z.infer<typeof contactSchema>;

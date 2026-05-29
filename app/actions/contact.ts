"use server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "validation" };

  const { nombre, empresa, email, telefono, industria, mensaje } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "config" };

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "Geodot Web <web@geodot.app>",
      to: process.env.CONTACT_TO ?? "hola@geodot.app",
      replyTo: email,
      subject: `Demo request — ${empresa}`,
      text: `Nombre: ${nombre}\nEmpresa: ${empresa}\nEmail: ${email}\nTel: ${telefono}\nIndustria: ${industria}\n\n${mensaje}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "send" };
  }
}

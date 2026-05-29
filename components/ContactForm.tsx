"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContact, type ContactResult } from "@/app/actions/contact";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);

  if (state?.ok) return <p className="rounded-lg bg-[color:var(--color-success)]/10 p-6 text-body-md text-[color:var(--color-success)]">{t("success")}</p>;

  return (
    <form action={action} className="grid gap-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="nombre" required placeholder={t("name")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="empresa" required placeholder={t("company")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="email" type="email" required placeholder={t("email")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="telefono" placeholder={t("phone")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <textarea name="mensaje" required rows={4} placeholder={t("message")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      {state && !state.ok && <p className="text-body-sm text-[color:var(--color-error)]">{t("error")}</p>}
      <button type="submit" disabled={pending}
        className="rounded-full bg-magenta-500 px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-magenta-600 disabled:opacity-60">
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}

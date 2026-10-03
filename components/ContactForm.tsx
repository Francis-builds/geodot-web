"use client";
import { useActionState, useId, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { submitContact, type ContactResult } from "@/app/actions/contact";
import { Button } from "./ui/Button";

const FIELD_CLS = "rounded-md border border-navy-200 px-4 py-3 text-body-md aria-[invalid=true]:border-magenta-500";
const LABEL_CLS = "mb-1.5 block text-body-sm font-medium text-navy-900";

const FALLBACK_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@geodot.app";

const subscribeNoop = () => () => {};
/** `?tipo=partner` on the page URL. Server snapshot is "" so hydration stays clean on the static page. */
function useInquiryType(): string {
  return useSyncExternalStore(
    subscribeNoop,
    () => new URLSearchParams(window.location.search).get("tipo") ?? "",
    () => "",
  );
}

export function ContactForm() {
  const t = useTranslations("contact.form");
  const tUi = useTranslations("ui.contact");
  const tipo = useInquiryType();
  const uid = useId();
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const failed = state !== null && !state.ok;
  const invalid = failed && state.error === "validation";
  const serverFailure = failed && (state.error === "config" || state.error === "send");

  if (state?.ok) {
    return (
      <p role="status" className="rounded-lg border border-success/30 bg-success/10 p-6 text-body-md text-navy-900">{t("success")}</p>
    );
  }

  return (
    <form action={action} noValidate={false} className="grid gap-5">
      {tipo === "partner" && <input type="hidden" name="tipo" value="partner" />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label htmlFor={`${uid}-nombre`} className={LABEL_CLS}>
          {t("name")} <span aria-hidden className="text-error">*</span>
        </label>
        <input id={`${uid}-nombre`} name="nombre" required aria-invalid={invalid || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      <div>
        <label htmlFor={`${uid}-empresa`} className={LABEL_CLS}>
          {t("company")} <span aria-hidden className="text-error">*</span>
        </label>
        <input id={`${uid}-empresa`} name="empresa" required aria-invalid={invalid || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      <div>
        <label htmlFor={`${uid}-email`} className={LABEL_CLS}>
          {t("email")} <span aria-hidden className="text-error">*</span>
        </label>
        <input id={`${uid}-email`} name="email" type="email" required aria-invalid={invalid || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      <div>
        <label htmlFor={`${uid}-telefono`} className={LABEL_CLS}>
          {t("phone")}
        </label>
        <input id={`${uid}-telefono`} name="telefono" aria-invalid={invalid || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      <div>
        <label htmlFor={`${uid}-mensaje`} className={LABEL_CLS}>
          {t("message")} <span aria-hidden className="text-error">*</span>
        </label>
        <textarea id={`${uid}-mensaje`} name="mensaje" rows={4} required aria-invalid={invalid || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      <p className="text-caption text-navy-600">{t("required")}</p>
      <div aria-live="polite">
        {failed && (
          <p id={`${uid}-error`} className="text-body-sm font-medium text-error">
            {serverFailure ? tUi("errorServer") : tUi("errorValidation")}
            {serverFailure && (
              <>
                {" "}{tUi("errorFallback")}{" "}
                <a href={`mailto:${FALLBACK_EMAIL}`} className="underline underline-offset-2">{FALLBACK_EMAIL}</a>
              </>
            )}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending} variant="primary">
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}

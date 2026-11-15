"use client";

import { useActionState } from "react";
import { emptyForm, type FormState } from "@/lib/types";

export function SketchForm({
  action,
  submitLabel,
  children,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, emptyForm);
  return (
    <form action={formAction} className="stack">
      {children}
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="ok" role="status">{state.ok}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Сохраняю…" : submitLabel}</button>
    </form>
  );
}

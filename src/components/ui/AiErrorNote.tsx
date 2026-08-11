import { ApiError } from "@/lib/apiClient";

export function AiErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const isConfig = error instanceof ApiError && error.code === "missing_api_key";
  const message = error instanceof Error ? error.message : "Ha ocurrido un error.";

  return (
    <div className="rounded-sm border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-ink animate-fade-up">
      <p className="font-medium mb-0.5">{isConfig ? "Falta configurar la IA" : "No se ha podido generar"}</p>
      <p className="text-ink-soft text-[13px] leading-relaxed">
        {message}
        {isConfig && (
          <>
            {" "}Copia <code className="code-inline text-[11px]">.env.example</code> a{" "}
            <code className="code-inline text-[11px]">.env.local</code>, añade tu clave de{" "}
            <code className="code-inline text-[11px]">ANTHROPIC_API_KEY</code> y reinicia{" "}
            <code className="code-inline text-[11px]">npm run dev</code>.
          </>
        )}
      </p>
    </div>
  );
}

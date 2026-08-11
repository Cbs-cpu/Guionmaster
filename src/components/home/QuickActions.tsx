import Link from "next/link";

const ACTIONS = [
  {
    href: "/reels/nuevo",
    index: "01",
    title: "Nuevo Reel",
    description: "Hooks, estructura de 7 beats y texto en pantalla para un short de 30-90s.",
  },
  {
    href: "/youtube/nuevo",
    index: "02",
    title: "Nuevo Vídeo",
    description: "Títulos, hook, promesa, capítulos y guion completo para YouTube.",
  },
  {
    href: "/biblioteca",
    index: "03",
    title: "Biblioteca",
    description: "Todos tus guiones: estado, favoritos, duplicar y editar.",
  },
  {
    href: "/conocimiento",
    index: "04",
    title: "Conocimiento",
    description: "Systems thinking, BPM, Value Stream, TOC, arquitectura empresarial.",
  },
];

export function QuickActions() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ACTIONS.map((a, i) => (
        <Link
          key={a.href}
          href={a.href}
          className="hover-lift animate-fade-up paper-panel rounded-sm px-5 py-4 flex flex-col justify-between group"
          style={{ animationDelay: `${260 + i * 60}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="label-caps text-[10px] text-ink-faint">{a.index}</span>
            <svg className="w-3.5 h-3.5 text-ink-faint group-hover:text-accent transition-colors" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H4M12 2V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display text-lg mb-1">{a.title}</h3>
          <p className="text-[13px] text-ink-soft leading-relaxed">{a.description}</p>
        </Link>
      ))}
    </div>
  );
}

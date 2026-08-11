import Link from "next/link";
import { HeroDiagram } from "@/components/home/HeroDiagram";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentScripts } from "@/components/home/RecentScripts";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="animate-fade-up">
        <p className="label-caps text-[10px] text-accent mb-4">System Content Studio</p>
        <h1 className="font-display text-[2.4rem] sm:text-[3.4rem] leading-[1.03] tracking-tight max-w-3xl">
          Una empresa
          <br />
          es un <em className="not-italic text-accent">sistema.</em>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] sm:text-base text-ink-soft leading-relaxed">
          Workspace privado para convertir lo que sabes sobre sistemas, procesos y tecnología
          en Reels y vídeos de YouTube que construyen autoridad y captan clientes para
          implantaciones Odoo y aplicaciones para entrenadores personales.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/reels/nuevo">
            <Button size="lg">Nuevo Reel</Button>
          </Link>
          <Link href="/youtube/nuevo">
            <Button size="lg" variant="secondary">
              Nuevo vídeo de YouTube
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 sm:mt-16 paper-panel rounded-sm px-5 sm:px-7 py-6">
        <p className="label-caps text-[10px] text-ink-faint mb-4">Ejemplo de sistema</p>
        <HeroDiagram />
      </div>

      <div className="mt-12 sm:mt-16">
        <p className="label-caps text-[10px] text-ink-faint mb-3">Empezar</p>
        <QuickActions />
      </div>

      <div className="mt-12 sm:mt-16">
        <RecentScripts />
      </div>
    </div>
  );
}

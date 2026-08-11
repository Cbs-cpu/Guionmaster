# System Content Studio

Workspace personal y privado para crear contenido (Reels/Shorts y vídeos de
YouTube) que enseña **"una empresa es un sistema"** y construye autoridad para
dos servicios: implantaciones de sistemas con **Odoo** y **apps para
entrenadores personales**.

No es un SaaS ni un "AI writer" genérico: es una herramienta local de guionización
con una metodología concreta (base de conocimiento, generadores, editor de
3 columnas, canvas de sistemas y biblioteca), pensada para un único usuario.

## Qué incluye (v1, spec §15)

1. **Base de conocimiento** (`/conocimiento`) — Systems Thinking, BPM, Value
   Stream, Theory of Constraints, Information Silos, Enterprise Architecture,
   Process Mining. Cada marco cita su fuente.
2. **Generador de Reels** (`/reels/nuevo`) — inputs → 5 hooks tipados → estructura
   completa (Hook → Problema → Consecuencia → Insight → Sistema → Beneficio → CTA).
3. **Generador de YouTube** (`/youtube/nuevo`) — inputs → 5 títulos → hook, promesa,
   capítulos, guion y visuales por sección.
4. **Editor** (`/editor/[id]`) — workspace de 3 columnas (Estructura · Guion · IA)
   con los 12 comandos de IA del spec y conversión Reel ↔ YouTube.
5. **Canvas** (`/canvas`) — whiteboard de sistemas (cajas, personas, procesos,
   bases de datos, inputs/outputs, cuellos de botella), con sugerencia por IA.
6. **Biblioteca** (`/biblioteca`) — todos los guiones con estado, favoritos,
   duplicar/eliminar.

Todo se guarda **en el navegador** (localStorage, vía Zustand) — no hay base
de datos ni backend con estado. Las únicas llamadas de red son a la API de
Anthropic para generar contenido.

## Poner en marcha en local

```bash
npm install
cp .env.example .env.local   # añade tu ANTHROPIC_API_KEY (console.anthropic.com)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin `ANTHROPIC_API_KEY` la
app funciona igual (navegación, base de conocimiento, canvas, biblioteca) pero
los botones de generación con IA muestran un aviso explicando cómo activarla.

## Desplegar en Vercel

Este agente no tiene credenciales de tu cuenta de Vercel, así que el despliegue
lo haces tú en un par de clics:

1. En [vercel.com/new](https://vercel.com/new), importa el repositorio
   `Cbs-cpu/Guionmaster` (rama `claude/system-content-studio-ctto15` o la que
   hayas mergeado a tu rama principal).
2. En **Environment Variables**, añade `ANTHROPIC_API_KEY` (y opcionalmente
   `ANTHROPIC_MODEL`).
3. Deploy. Framework preset "Next.js" se detecta automáticamente.

Ten en cuenta que el spec pide una herramienta **local y privada**: el
almacenamiento vive en el navegador de cada visitante, así que si varias
personas abren la URL de Vercel, cada una tendrá su propia biblioteca vacía
en su propio navegador — no hay sincronización entre dispositivos.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Zustand (persist) ·
Anthropic SDK · Fraunces / Public Sans / IBM Plex Mono.

## Skills instaladas

Vía `npx skills@latest add …` (ver `skills-lock.json` y `.agents/skills`):
diseño e interacción de Emil Kowalski (`emilkowalski/skills`), el skill
oficial `anthropic-frontend-design`, y una selección de skills de
guionización/copywriting/estrategia de contenido usadas como referencia al
redactar los prompts de IA (`script-writer`, `scriptwriting-methodology`,
`short-form-video`, `video-script`, `content-strategy`, `content-marketing`,
`alterlab-pra-copywriter`).

import { Film, GalleryHorizontalEnd, MonitorPlay } from "lucide-react";
import type { ScriptType } from "@/lib/types";
import type { SourcePlatform } from "@/lib/types";

export const SCRIPT_TYPE_ICONS: Record<ScriptType, React.ComponentType<{ className?: string }>> = {
  reel: Film,
  youtube: MonitorPlay,
  carrusel: GalleryHorizontalEnd,
};

export const SOURCE_PLATFORM_ICONS: Record<SourcePlatform, React.ComponentType<{ className?: string }>> = {
  reel: Film,
  youtube: MonitorPlay,
  instagram: GalleryHorizontalEnd,
};

import { Chord } from "@/app/lib/algs/chord-finder";
import { Slice } from "@/app/lib/algs/slicer";
import { Tuning } from "@/app/lib/tunings";

export type alphatexOptions = {
  title?: string;
  tuning?: Tuning;
  capo?: number;
  timeSigTop?: number;
  timeSigBottom?: number;
};

export default function alphatexGenerator(
  slices: Slice[],
  chords: Chord[],
  { title, tuning, capo, timeSigTop, timeSigBottom }: alphatexOptions,
): string {
  return "";
}

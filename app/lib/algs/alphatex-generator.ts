import { Chord, Fret } from "@/app/lib/algs/chord-finder";
import { Slice } from "@/app/lib/algs/slicer";
import { defaultTuning, Tuning } from "@/app/lib/tunings";
import { midiToNoteName } from "@tonaljs/midi";

export type alphatexOptions = {
  title?: string;
  tuning: Tuning;
  capo?: Fret;
  timeSigTop?: number;
  timeSigBottom?: number;
};

export default function alphatexGenerator(
  slices: Slice[],
  chords: Chord[],
  {
    title = "Untitled",
    tuning,
    capo = 0,
    timeSigTop = 4,
    timeSigBottom = 4,
  }: alphatexOptions,
): string {
  const texArr: string[] = [];

  /* Metadata */

  texArr.push(`\\title "${title}"`);

  if (tuning !== defaultTuning) {
    const pitches = tuning.pitches
      .reverse()
      .map((p) => midiToNoteName(p, { sharps: true }));

    texArr.push(`\\tuning (${pitches.join(" ")}) { label "${tuning.name}" }`);
  }

  if (capo > 0) {
    texArr.push(`\\capo ${capo}`);
  }

  texArr.push(`\\ts ${timeSigTop} ${timeSigBottom}`);

  // texArr.push(":4 3.5 5.5 7.5 3.5");

  return texArr.join("\n");
}

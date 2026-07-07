"use server";

import alphatexGenerator from "@/app/lib/algs/alphatex-generator";
import chordFinder, {
  Chord,
  Fret,
  HandSpan,
} from "@/app/lib/algs/chord-finder";
import slicer, { SlicerInputNote } from "@/app/lib/algs/slicer";
import { songPathfinder } from "@/app/lib/algs/song-pathfinder";
import { Tuning, tunings } from "@/app/lib/tunings";
import { Pitch } from "@/app/lib/types";
import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import z from "zod";

const maxAllowableFret = 24;
const maxAllowableHandSpan = 6;
const allowableTimeSigBottoms = [2, 4, 8, 16];

const ConversionFormDataSchema = z.object({
  tuning: z.enum(
    tunings.reduce(
      (acc: string[], tuning: Tuning) => [...acc, tuning.value],
      [],
    ),
  ),
  capo: z.coerce.number().nonnegative().lte(maxAllowableFret),
  "min-fret": z.coerce.number().nonnegative().lte(maxAllowableFret),
  "max-fret": z.coerce.number().nonnegative().lte(maxAllowableFret),
  "hand-span": z.coerce.number().nonnegative().lte(maxAllowableHandSpan),
  // "max-notes-per-chord": z.coerce.number().nonnegative().lte(6), // standard guitars cannot play more than 6 notes at once
  "time-sig-top": z.coerce.number().gte(2).lte(12), // BPMs higher than 12 are currently unsupported
  "time-sig-bottom": z.coerce
    .number()
    .pipe(z.union(allowableTimeSigBottoms.map((e) => z.literal(e)))),
});

export type State = {
  errors?: [string, string[]][];
  tex?: string;
};

export async function convertMidiToTab(formData: FormData): Promise<State> {
  /* Form validation */

  const rawFormData: { [key: string]: FormDataEntryValue } = {};
  for (const pair of formData.entries()) {
    rawFormData[pair[0]] = pair[1];
  }

  const validatedFormData = ConversionFormDataSchema.safeParse(rawFormData);
  if (!validatedFormData.success) {
    const fieldErrors = z.flattenError(validatedFormData.error).fieldErrors;
    return { errors: Object.entries(fieldErrors) };
  }

  const file: File = formData.get("file-upload") as File;
  if (file.size === 0) {
    return { errors: [["MIDI", ["No MIDI uploaded."]]] };
  }

  const tuning = tunings.find(
    (t) => t.value === validatedFormData.data.tuning,
  )!;

  /* Slice creation */

  const midi = new Midi(await file.arrayBuffer());
  const notes: SlicerInputNote[] = midi.tracks
    .flatMap((t) => t.notes)
    .map((e: Note): SlicerInputNote => {
      const on = e.ticks;
      return {
        pitch: e.midi,
        on,
        off: on + e.durationTicks,
      };
    });

  const slices = slicer({ notes, endTick: midi.durationTicks });

  /* Chord creation */

  const chords: Chord[][] = [];

  const chordOptions = {
    tuning,
    capo: validatedFormData.data.capo as Fret,
    minFret: validatedFormData.data["min-fret"] as Fret,
    maxFret: validatedFormData.data["max-fret"] as Fret,
    span: validatedFormData.data["hand-span"] as HandSpan,
  };

  let message: string = "";
  const errorCb = (cbMessage: string) => {
    message = cbMessage;
  };

  let unused: Pitch[] = []; // unused pitches (between chordFinder calls)

  for (let i = 0; i < slices.length; i++) {
    const results = chordFinder(slices[i], chordOptions, unused, errorCb);

    if (message !== "" || !results) {
      return { errors: [["Chord Finder", [message]]] };
    }

    const { chords: foundChords, unusedPitches } = results;

    chords[i] = foundChords;
    unused = unusedPitches;
  }

  // console.log(JSON.stringify(chords, undefined, 2));

  /* Pathfinding */

  const song = songPathfinder(slices, chords, midi.header.ppq);

  // console.log(JSON.stringify(song, undefined, 2));

  /* alphaTex generation */

  const title = file.name.replace(/\.mid$/, "");

  const tex = alphatexGenerator(slices, song, {
    ppq: midi.header.ppq,
    title,
    tuning,
    capo: validatedFormData.data.capo as Fret,
    timeSigTop: validatedFormData.data["time-sig-top"],
    timeSigBottom: validatedFormData.data["time-sig-bottom"],
  });

  return { tex };
}

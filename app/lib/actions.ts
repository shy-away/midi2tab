"use server";

import alphatexGenerator from "@/app/lib/algs/alphatex-generator";
import chordFinder, {
  Chord,
  Fret,
  HandSpan,
} from "@/app/lib/algs/chord-finder";
import slicer, { Slice, SlicerInputNote } from "@/app/lib/algs/slicer";
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

  /* Slice creation */

  const midi = new Midi(await file.arrayBuffer());
  const notes: SlicerInputNote[] = midi.tracks[0].notes.map(
    (e: Note): SlicerInputNote => {
      const on = e.ticks;
      return {
        pitch: e.midi,
        on,
        off: on + e.durationTicks,
      };
    },
  );

  let erred: boolean = false;

  const slices = slicer({ notes, endTick: midi.durationTicks }, () => {
    erred = true;
  });

  if (erred) {
    return { errors: [["MIDI Slicer", ["Too many notes at once."]]] };
  }

  /* Chord creation */

  const chords: Chord[][] = [];

  const chordOptions = {
    tuning: tunings.find((t) => t.value === validatedFormData.data.tuning)!,
    capo: validatedFormData.data.capo as Fret,
    minFret: validatedFormData.data["min-fret"] as Fret,
    maxFret: validatedFormData.data["max-fret"] as Fret,
    span: validatedFormData.data["hand-span"] as HandSpan,
  };

  let message: string = "";
  const errorCb = (cbMessage: string) => {
    message = cbMessage;
  };

  for (let i = 0; i < slices!.length; i++) {
    const slice: Slice = slices![i];

    const slicePitches: Pitch[] = slice.notes.map(
      ({ pitch }) => pitch as Pitch,
    );

    const chord = chordFinder(slicePitches, chordOptions, errorCb);

    if (message !== "") {
      return { errors: [["Chord Finder", [message]]] };
    }

    chords[i] = chord!;
  }

  // console.log(JSON.stringify(chords, undefined, 2));

  /* Pathfinding */

  const song = songPathfinder(slices!, chords, midi.header.ppq);

  // console.log(JSON.stringify(song, undefined, 2));

  /* alphaTex generation */

  const title = file.name.replace(/\.mid$/, "");

  const tex = alphatexGenerator(slices!, song, {
    ppq: midi.header.ppq,
    title,
    tuning: tunings.find((t) => t.value === validatedFormData.data.tuning)!,
    capo: validatedFormData.data.capo as Fret,
    timeSigTop: validatedFormData.data["time-sig-top"],
    timeSigBottom: validatedFormData.data["time-sig-bottom"],
  });

  return { tex };
}

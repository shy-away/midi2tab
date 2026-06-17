"use server";

import { Tuning, tunings } from "@/app/lib/tunings";
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
  "max-notes-per-chord": z.coerce.number().nonnegative().lte(6), // standard guitars cannot play more than 6 notes at once
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
  const rawFormData: { [key: string]: FormDataEntryValue } = {};
  for (const pair of formData.entries()) {
    rawFormData[pair[0]] = pair[1];
  }
  // console.log(rawFormData);

  const validatedFormData = ConversionFormDataSchema.safeParse(rawFormData);

  if (!validatedFormData.success) {
    const fieldErrors = z.flattenError(validatedFormData.error).fieldErrors;
    return { errors: Object.entries(fieldErrors) };
  }

  const file: File = formData.get("file-upload") as File;

  if (file.size === 0) {
    return { errors: [["MIDI", ["No MIDI uploaded."]]] };
  }

  // console.log("Array buffer:", await file.arrayBuffer());

  let fileName = file.name.slice(0, -4);
  if (fileName === "") fileName = "Untitled";

  const tex = `\\title ${fileName} :4 3.5 5.5 7.5 3.5`;

  return { tex };
}

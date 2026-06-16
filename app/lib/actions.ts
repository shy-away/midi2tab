"use server";

export type State = {
  error?: string;
  tex?: string;
};

export async function convertMidiToTab(formData: FormData): Promise<State> {
  console.log("### DATA RECEIVED ###");

  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const file: File = formData.get("file-upload") as File;

  if (file.size === 0) {
    return { error: "No MIDI uploaded." };
  }

  // console.log("Array buffer:", await file.arrayBuffer());
  console.log("### END DATA RECEIVED ###");

  let fileName = file.name.slice(0, -4);
  if (fileName === "") fileName = "Untitled";

  const tex = `\\title ${fileName} :4 3.5 5.5 7.5 3.5`;

  return { tex };
}

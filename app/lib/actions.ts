"use server";

export async function convertMidiToTab(formData: FormData): Promise<object> {
  console.log("### DATA RECEIVED ###");

  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const file: File = formData.get("file_upload") as File;

  if (file.size === 0) {
    return { error: "No MIDI uploaded." };
  }

  // console.log("Array buffer:", await file.arrayBuffer());
  console.log("### END DATA RECEIVED ###");

  return {};
}

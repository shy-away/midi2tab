"use client";

import { convertMidiToTab } from "@/app/lib/actions";
import styles from "@/app/styles/barberpole-bg.module.scss";
import MidiInput from "@/app/ui/midi-input";
import { useActionState } from "react";

export default function Home() {
  const action = async (_: object, formData: FormData) =>
    await convertMidiToTab(formData);

  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <div
      className={`${styles.barberpoleBg} grow min-h-full flex flex-col items-center pb-4`}
    >
      <MidiInput action={formAction} />

      {/* Presets */}
      {
        // TODO: add presets
      }
    </div>
  );
}

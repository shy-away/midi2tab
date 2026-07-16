import { defaultTuning } from "@/app/lib/tunings";
import { Button } from "@/components/ui/button";
import { startTransition } from "react";

const defaultFormValues = {
  tuning: defaultTuning.value,
  capo: "0",
  "min-fret": "0",
  "max-fret": "15",
  "hand-span": "4",
  "max-notes-at-once": "6",
  "time-sig-top": "4",
  "time-sig-bottom": "4",
  transpose: "0",
  "auto-transpose": "false",
};

const presetsData: {
  name: string;
  fileName?: string;
  customOptions?: Partial<Record<keyof typeof defaultFormValues, string>>;
}[] = [
  {
    name: "Ode to Joy",
    customOptions: { "max-fret": "12" },
  },
  {
    name: "Ode to Joy (Easy)",
    fileName: "Ode to Joy",
    customOptions: {
      tuning: "d_drop",
      "max-fret": "5",
      "max-notes-at-once": "3",
      "auto-transpose": "true",
    },
  },
  {
    name: "Autumn Leaves",
  },
];

export default function Presets({
  action,
}: {
  action: (payload: FormData) => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-xl">Presets</h2>
      <div className="flex gap-3">
        {presetsData.map((preset) => {
          const handlePresetClick = async () => {
            const fileName = `${preset.fileName ? preset.fileName : preset.name}.mid`;

            const res = await fetch(`/midi/${fileName}`);
            const blob = await res.blob();

            const file = new File([blob], fileName, {
              type: blob.type || "audio/midi",
            });

            const data = new FormData();

            Object.entries({
              ...defaultFormValues,
              ...preset.customOptions,
            }).forEach(([key, value]) => data.set(key, value));

            data.set("file-upload", file);

            startTransition(() => action(data));
          };

          return (
            <form key={preset.name} action={handlePresetClick}>
              <Button type="submit">{preset.name}</Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

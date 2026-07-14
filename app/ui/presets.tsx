import { defaultTuning } from "@/app/lib/tunings";
import { Button } from "@/components/ui/button";

const defaultFormValues = {
  tuning: defaultTuning.value,
  capo: "0",
  "min-fret": "0",
  "max-fret": "15",
  "hand-span": "4",
  "time-sig-top": "4",
  "time-sig-bottom": "4",
};

const presetsData: {
  name: string;
  fileName: string;
  customOptions?: object;
}[] = [
  {
    name: "Ode to Joy",
    fileName: "l-v-beethoven-ode-to-joy.mid",
    customOptions: { "max-fret": "12" },
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
      <div className="flex">
        {presetsData.map((preset) => {
          const handlePresetClick = async () => {
            const res = await fetch(`/midi/${preset.fileName}`);
            const blob = await res.blob();

            const file = new File([blob], preset.fileName, {
              type: blob.type || "audio/midi",
            });

            const data = new FormData();

            Object.entries({
              ...defaultFormValues,
              ...preset.customOptions,
            }).forEach(([key, value]) => data.set(key, value));

            data.set("file-upload", file);

            action(data);
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

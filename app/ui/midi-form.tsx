"use client";

import { commonTimeSigs, getTimeSigString } from "@/app/lib/time-sigs";
import { tunings } from "@/app/lib/tunings";
import MidiFileUpload from "@/app/ui/midi-file-upload";
import InputWithPlusMinusButtons from "@/components/shadcn-studio/input/input-plus-minus";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type MidiFormState = {
  tuning: string;
  capoFret: number;
  maxFret: number;
  minFret: number;
  handSpan: number;
  maxNotesAtOnce: number;
  selectedTimeSig: string;
  timeSigTop: number;
  timeSigBottom: number;
  customTimeSigTop: number;
  customTimeSigBottom: number;
  transpose: number;
  autoTranspose: AutoTransposeOptions;
};

type AutoTransposeOptions = "true" | "false";

export const initialMidiFormState = {
  tuning: "e_standard",
  capoFret: 0,
  maxFret: 15,
  minFret: 0,
  handSpan: 4,
  maxNotesAtOnce: 6,
  selectedTimeSig: "4/4",
  timeSigTop: 4,
  timeSigBottom: 4,
  customTimeSigTop: 4,
  customTimeSigBottom: 4,
  transpose: 0,
  autoTranspose: "false" as AutoTransposeOptions,
};

export default function MidiInput({
  action,
  formState,
  setFormState,
}: {
  action: (payload: FormData) => void;
  formState: MidiFormState;
  setFormState: React.Dispatch<React.SetStateAction<MidiFormState>>;
}) {
  function updateFormState<K extends keyof MidiFormState>(
    key: K,
    value: MidiFormState[K],
  ) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function formStateUpdaterFactory<K extends keyof MidiFormState>(key: K) {
    return (value: MidiFormState[K]) => updateFormState(key, value);
  }

  const {
    tuning,
    capoFret,
    maxFret,
    minFret,
    handSpan,
    maxNotesAtOnce,
    selectedTimeSig,
    timeSigTop,
    timeSigBottom,
    customTimeSigTop,
    customTimeSigBottom,
    transpose,
    autoTranspose,
  } = formState;

  function handleCustomTimeSigBottom(value: number) {
    const updateTimeSigBottomAndReturn = (x: number) => {
      updateFormState("timeSigBottom", x);
      return x;
    };

    let newCustomTimeSigBottom: number;

    if (value === customTimeSigBottom - 1) {
      newCustomTimeSigBottom = customTimeSigBottom / 2;
    } else {
      newCustomTimeSigBottom = customTimeSigBottom * 2;
    }

    updateFormState(
      "customTimeSigBottom",
      updateTimeSigBottomAndReturn(newCustomTimeSigBottom),
    );
  }

  return (
    <form action={action}>
      <div className="grow items-center max-w-screen-sm mx-auto mb-3 space-y-4 sm:flex sm:space-y-0">
        <MidiFileUpload name="file-upload" />
      </div>
      <div id="midi-input-divier" className="border-2"></div>
      {/* Config options */}
      <div className="p-3 flex justify-center gap-4 flex-wrap items-stretch">
        {/* Tuning */}
        <label htmlFor="tuning" className="min-w-40">
          Tuning
          <div id="tuning" className="mt-2">
            <Select
              name="tuning"
              value={tuning}
              onValueChange={formStateUpdaterFactory("tuning")}
              defaultValue="e_standard"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tuning" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {tunings.map((tuning, tuningIndex) => (
                    <SelectItem key={tuningIndex} value={tuning.value}>
                      {tuning.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </label>
        {/* Capo */}
        <section className="max-w-30">
          <span id="capo">Capo</span>
          <div className="mt-2">
            <InputWithPlusMinusButtons
              aria-labelledby="capo"
              name="capo"
              value={capoFret}
              onChange={formStateUpdaterFactory("capoFret")}
              minValue={0}
              maxValue={maxFret}
            />
          </div>
        </section>
        <div className="flex gap-4">
          {/* Min Fret */}
          <section className="max-w-30">
            <span id="minFret">Min Fret</span>
            <div className="mt-2">
              <InputWithPlusMinusButtons
                aria-labelledby="minFret"
                name="min-fret"
                value={minFret}
                onChange={formStateUpdaterFactory("minFret")}
                minValue={capoFret}
                maxValue={maxFret}
              />
            </div>
          </section>
          {/* Max Fret */}
          <section className="max-w-30">
            <span id="maxFret">Max Fret</span>
            <div className="mt-2">
              <InputWithPlusMinusButtons
                aria-labelledby="maxFret"
                name="max-fret"
                value={maxFret}
                onChange={formStateUpdaterFactory("maxFret")}
                minValue={minFret}
                maxValue={24}
              />
            </div>
          </section>
        </div>
        {/* Hand Span */}
        <section className="max-w-30">
          <span id="handSpan">Hand Span</span>
          <div className="mt-2">
            <InputWithPlusMinusButtons
              aria-labelledby="handSpan"
              name="hand-span"
              value={handSpan}
              onChange={formStateUpdaterFactory("handSpan")}
              minValue={1}
              maxValue={6}
            />
          </div>
        </section>
        {/* Max Notes At Once */}
        <section className="max-w-45">
          <span id="maxNotesAtOnce">Max Notes At Once</span>
          <div className="mt-2">
            <InputWithPlusMinusButtons
              aria-labelledby="maxNotesAtOnce"
              name="max-notes-at-once"
              value={maxNotesAtOnce}
              onChange={formStateUpdaterFactory("maxNotesAtOnce")}
              minValue={1}
              maxValue={6}
            />
          </div>
        </section>
        {/* Time signature */}
        <section className="flex flex-col">
          <div id="timeSig">Time signature</div>
          <input type="hidden" name="time-sig-top" value={timeSigTop} />
          <input type="hidden" name="time-sig-bottom" value={timeSigBottom} />
          <ToggleGroup
            aria-labelledby="timeSig"
            type="single"
            variant={"outline"}
            className="mt-2"
            value={selectedTimeSig}
            onValueChange={(value: string) => {
              if (!value) return;
              updateFormState("selectedTimeSig", value);

              if (value !== "custom") {
                const [top, bottom] = value.split("/").map(Number);
                updateFormState("timeSigTop", top);
                updateFormState("timeSigBottom", bottom);
              }
            }}
          >
            {commonTimeSigs.map((timeSig) => {
              const timeSigString = getTimeSigString(timeSig);

              return (
                <ToggleGroupItem
                  key={timeSigString}
                  value={timeSigString}
                  aria-label={timeSigString}
                  className="h-min py-1"
                >
                  <div className="flex flex-col">
                    <div>{timeSig.top}</div>
                    <TimeSigDivider />
                    <div>{timeSig.bottom}</div>
                  </div>
                </ToggleGroupItem>
              );
            })}
            <ToggleGroupItem value="custom" aria-label="Custom">
              <Popover>
                <PopoverTrigger asChild>
                  <div>Custom</div>
                </PopoverTrigger>
                <PopoverContent className="max-w-40">
                  <InputWithPlusMinusButtons
                    aria-label="Custom time signature top"
                    value={customTimeSigTop}
                    onChange={(value: number) => {
                      updateFormState("customTimeSigTop", value);
                      updateFormState("timeSigTop", value);
                    }}
                    minValue={2}
                    maxValue={12}
                  />
                  <TimeSigDivider />
                  <InputWithPlusMinusButtons
                    aria-label="Custom time signature bottom"
                    value={customTimeSigBottom}
                    onChange={handleCustomTimeSigBottom}
                    minValue={2}
                    maxValue={16}
                  />
                </PopoverContent>
              </Popover>
            </ToggleGroupItem>
          </ToggleGroup>
        </section>
        {/* Transposition */}
        <section className="flex gap-4">
          {/* Manual transpose */}
          <section className="max-w-30">
            <span id="transpose">Transpose</span>
            <div className="mt-2">
              <InputWithPlusMinusButtons
                aria-labelledby="transpose"
                value={transpose}
                onChange={formStateUpdaterFactory("transpose")}
                minValue={-12}
                maxValue={12}
                isDisabled={autoTranspose === "true"}
              />
              <input type="hidden" name="transpose" value={transpose} />
            </div>
          </section>
          {/* Auto-transpose */}
          <section className="flex flex-col justify-center items-center self-stretch gap-2">
            <span id="auto-transpose">Auto-transpose?</span>
            <Switch
              aria-labelledby="auto-transpose"
              checked={autoTranspose === "true"}
              onCheckedChange={(checked: boolean) =>
                updateFormState("autoTranspose", checked ? "true" : "false")
              }
            />
            <input type="hidden" name="auto-transpose" value={autoTranspose} />
          </section>
        </section>
      </div>
      <div className="pt-4 flex justify-center items-start">
        <Button type="submit" size="lg">
          Submit
        </Button>
      </div>
    </form>
  );
}

function TimeSigDivider(): React.ReactElement {
  return <div className="border-t border-white"></div>;
}

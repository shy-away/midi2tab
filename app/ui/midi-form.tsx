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
import { useState } from "react";

export default function MidiInput({
  action,
}: {
  action: (payload: FormData) => void;
}) {
  const [tuning, setTuning] = useState("e_standard");
  const [capoFret, setCapoFret] = useState<number>(0);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [minFret, setMinFret] = useState<number>(0);
  const [handSpan, setHandSpan] = useState<number>(4);
  const [maxNotesAtOnce, setMaxNotesAtOnce] = useState<number>(6);
  const [selectedTimeSig, setSelectedTimeSig] = useState("4/4");
  const [timeSigTop, setTimeSigTop] = useState<number>(4);
  const [timeSigBottom, setTimeSigBottom] = useState<number>(4);
  const [customTimeSigTop, setCustomTimeSigTop] = useState<number>(4);
  const [customTimeSigBottom, setCustomTimeSigBottom] = useState<number>(4);
  const [transpose, setTranspose] = useState<number>(0);
  const [autoTranspose, setAutoTranspose] = useState<"true" | "false">("false");

  function handleCustomTimeSigBottom(value: number) {
    const updateTimeSigBottomAndReturn = (x: number) => {
      setTimeSigBottom(x);
      return x;
    };

    if (value === customTimeSigBottom - 1)
      setCustomTimeSigBottom((prev) => updateTimeSigBottomAndReturn(prev / 2));
    else
      setCustomTimeSigBottom((prev) => updateTimeSigBottomAndReturn(prev * 2));
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
              onValueChange={setTuning}
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
              onChange={setCapoFret}
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
                onChange={setMinFret}
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
                onChange={setMaxFret}
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
              onChange={setHandSpan}
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
              onChange={setMaxNotesAtOnce}
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
              setSelectedTimeSig(value);
              if (value !== "custom") {
                const [top, bottom] = value.split("/").map(Number);
                setTimeSigTop(top);
                setTimeSigBottom(bottom);
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
                      setCustomTimeSigTop(value);
                      setTimeSigTop(value);
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
                onChange={setTranspose}
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
              onCheckedChange={() =>
                setAutoTranspose((prev) => (prev === "true" ? "false" : "true"))
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

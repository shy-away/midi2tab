"use client";

import { commonTimeSigs, getTimeSigString } from "@/app/lib/time-sigs";
import { tunings } from "@/app/lib/tunings";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UploadCloudIcon } from "lucide-react";
import { useState } from "react";

export default function MidiInput({
  action,
}: {
  action: (payload: FormData) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [capoFret, setCapoFret] = useState<number>(0);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [minFret, setMinFret] = useState<number>(0);
  const [handSpan, setHandSpan] = useState<number>(4);
  const [maxNotesPerChord, setMaxNotesPerChord] = useState<number>(6);
  const [timeSigTop, setTimeSigTop] = useState<number>(4);
  const [timeSigBottom, setTimeSigBottom] = useState<number>(4);
  const [customTimeSigTop, setCustomTimeSigTop] = useState<number>(4);
  const [customTimeSigBottom, setCustomTimeSigBottom] = useState<number>(4);

  function handleCustomTimeSigBottom(value: number) {
    if (value === customTimeSigBottom - 1)
      setCustomTimeSigBottom((prev) => prev / 2);
    else setCustomTimeSigBottom((prev) => prev * 2);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    if (file === undefined) return;
    setFileName(file.name);
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);
  }

  return (
    <form
      action={action}
    >
      <div className="grow items-center max-w-screen-sm mx-auto mb-3 space-y-4 sm:flex sm:space-y-0">
        {/*
          Midi Input Element
          Modified from: https://tailwindflex.com/@anonymous/file-input
        */}
        <div className="relative w-full">
          <div className="items-center justify-center max-w-xl mx-auto">
            <label
              className="flex justify-center w-full h-32 px-4 transition bg-blend-color border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-white focus:outline-none"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <span className="space-x-2 flex flex-col justify-evenly items-center">
                {fileName && <span>Uploaded {fileName}</span>}
                <span className="flex items-center space-x-2">
                  <UploadCloudIcon color="#4a5565" />
                  {/* matches tailwind's text-gray-600 */}
                  <span className="font-medium text-gray-600">
                    Drag and drop, or
                    <span className="text-blue-600 underline ml-1">browse</span>
                  </span>
                </span>
              </span>
              <input
                type="file"
                name="file_upload"
                className="hidden"
                accept="midi"
                id="input"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>
      <div id="midi-input-divier" className="border-2"></div>
      {/* Config options */}
      <div className="p-3 flex justify-center gap-4 flex-wrap items-start">
        {/* Tuning */}
        <label htmlFor="tuning" className="min-w-40">
          Tuning
          <div id="tuning" className="mt-2">
            <Select>
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
                name="minFret"
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
                name="maxFret"
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
              name="handSpan"
              value={handSpan}
              onChange={setHandSpan}
              minValue={1}
              maxValue={6}
            />
          </div>
        </section>
        {/* Max Notes Per Chord */}
        <section className="max-w-45">
          <span id="maxNotesPerChord">Max Notes Per Chord</span>
          <div className="mt-2">
            <InputWithPlusMinusButtons
              aria-labelledby="maxNotesPerChord"
              name="maxNotesPerChord"
              value={maxNotesPerChord}
              onChange={setMaxNotesPerChord}
              minValue={1}
              maxValue={6}
            />
          </div>
        </section>
        {/* Time signature */}
        <section className="flex flex-col">
          <div id="timeSig">Time signature</div>
          <input
            type="hidden"
            name="timeSig"
            value={getTimeSigString({
              top: timeSigTop,
              bottom: timeSigBottom,
            })}
          />
          <ToggleGroup
            aria-labelledby="timeSig"
            type="single"
            variant={"outline"}
            className="mt-2"
            defaultValue="4/4"
            onValueChange={(value: string) => {
              switch (value) {
                case "":
                  return;
                case "custom":
                  // custom values have their own handler
                  break;
                default:
                  const timeSigData = value.split("/");
                  const timeSigTop = Number(timeSigData[0]);
                  const timeSigBottom = Number(timeSigData[1]);
                  setTimeSigTop(timeSigTop);
                  setTimeSigBottom(timeSigBottom);
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
            <ToggleGroupItem key="custom" value="custom" aria-label="custom">
              <Popover>
                <PopoverTrigger asChild>
                  <div>Custom</div>
                </PopoverTrigger>
                <PopoverContent
                  onCloseAutoFocus={() => {
                    setTimeSigTop(customTimeSigTop);
                    setTimeSigBottom(customTimeSigBottom);
                  }}
                  className="max-w-40"
                >
                  <InputWithPlusMinusButtons
                    aria-label="Custom time signature top"
                    name="customTimeSigTop"
                    value={customTimeSigTop}
                    onChange={setCustomTimeSigTop}
                    minValue={2}
                    maxValue={12}
                  />
                  <TimeSigDivider />
                  <InputWithPlusMinusButtons
                    aria-label="Custom time signature bottom"
                    name="customTimeSigBottom"
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

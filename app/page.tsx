"use client";

import { tunings } from "@/app/lib/tunings";
import styles from "@/app/styles/barberpole-bg.module.scss";
import InputWithPlusMinusButtons from "@/components/shadcn-studio/input/input-plus-minus";
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
import React, { useState } from "react";

type TimeSig = {
  top: number;
  bottom: number;
};

const commonTimeSigs: TimeSig[] = [
  {
    top: 4,
    bottom: 4,
  },
  {
    top: 3,
    bottom: 4,
  },
  {
    top: 6,
    bottom: 8,
  },
];

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileArrayBufferCreator, setFileArrayBufferCreator] = useState<
    (() => Promise<ArrayBuffer>) | null
  >(null);

  const [capoFret, setCapoFret] = useState<number>(0);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [minFret, setMinFret] = useState<number>(0);
  const [handSpan, setHandSpan] = useState<number>(4);
  const [maxNotesPerChord, setMaxNotesPerChord] = useState<number>(6);
  const [customTimeSigTop, setCustomTimeSigTop] = useState<number>(4);
  const [customTimeSigBottom, setCustomTimeSigBottom] = useState<number>(4);

  function handleCustomTimeSigBottom(value: number) {
    if (value === customTimeSigBottom - 1)
      setCustomTimeSigBottom((prev) => prev / 2);
    else setCustomTimeSigBottom((prev) => prev * 2);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    setFileName(file.name);
    setFileArrayBufferCreator(file.arrayBuffer);
  }

  async function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);
    setFileArrayBufferCreator(file.arrayBuffer);
  }

  return (
    <div
      className={`${styles.barberpoleBg} grow min-h-full flex flex-col items-center pb-4`}
    >
      {/* Midi Input */}
      <div className="mt-3 w-11/12 md:w-8/12 lg:max-w-200 rounded-3xl border-2 p-5 backdrop-blur-xs">
        <form action="">
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
                  onDrop={handleDrop}
                >
                  <span className="space-x-2 flex flex-col justify-evenly items-center">
                    {fileName && <span>Uploaded {fileName}</span>}
                    <span className="flex items-center space-x-2">
                      <UploadCloudIcon color="#4a5565" />
                      {/* matches tailwind's text-gray-600 */}
                      <span className="font-medium text-gray-600">
                        Drag and drop, or
                        <span className="text-blue-600 underline ml-1">
                          browse
                        </span>
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
              <label htmlFor="timeSig">Time signature</label>
              <ToggleGroup
                id="timeSig"
                type="single"
                variant={"outline"}
                className="mt-2"
                defaultValue="4/4"
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
                <ToggleGroupItem
                  key="custom"
                  value="custom"
                  aria-label="custom"
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>Custom</div>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-40">
                      <div id="customTimeSigTop">
                        <InputWithPlusMinusButtons
                          aria-label="Custom time signature top"
                          name="customTimeSigTop"
                          value={customTimeSigTop}
                          onChange={setCustomTimeSigTop}
                          minValue={2}
                          maxValue={12}
                        />
                      </div>
                      <TimeSigDivider />
                      <div id="customTimeSigBottom">
                        <InputWithPlusMinusButtons
                          aria-label="Custom time signature bottom"
                          name="customTimeSigBottom"
                          value={customTimeSigBottom}
                          onChange={handleCustomTimeSigBottom}
                          minValue={2}
                          maxValue={16}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </ToggleGroupItem>
              </ToggleGroup>
            </section>
          </div>
        </form>
      </div>

      {/* Presets */}
      {
        // TODO: add presets
      }
    </div>
  );
}

function TimeSigDivider(): React.ReactElement {
  return <div className="border-t border-white"></div>;
}

function getTimeSigString(timeSig: TimeSig): string {
  return timeSig.top + "/" + timeSig.bottom;
}

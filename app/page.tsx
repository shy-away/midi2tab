"use client";

import { tunings } from "@/app/lib/tunings";
import styles from "@/app/styles/barberpole-bg.module.scss";
import InputWithPlusMinusButtons from "@/components/shadcn-studio/input/input-plus-minus";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloudIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileArrayBufferCreator, setFileArrayBufferCreator] = useState<
    (() => Promise<ArrayBuffer>) | null
  >(null);

  const [capoFret, setCapoFret] = useState<number>(0);
  const [maxFret, setMaxFret] = useState<number>(15);
  const [minFret, setMinFret] = useState<number>(0);

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
      className={`${styles.barberpoleBg} grow min-h-full flex flex-col items-center`}
    >
      {/* Midi Input */}
      <div className="mt-3 w-11/12 md:w-8/12 lg:max-w-200 rounded-3xl border-2 p-5 backdrop-blur-xs">
        <form action="">
          <div className="flex-1 items-center max-w-screen-sm mx-auto mb-3 space-y-4 sm:flex sm:space-y-0">
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
          <div className="p-3 flex justify-center gap-4">
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
            <label htmlFor="capo" className="max-w-30">
              Capo
              <div id="capo" className="mt-2">
                <InputWithPlusMinusButtons
                  name="capo"
                  value={capoFret}
                  onChange={setCapoFret}
                  minValue={0}
                  maxValue={maxFret}
                />
              </div>
            </label>
            <div className="flex gap-4">
              {/* Min Fret */}
              <label htmlFor="minFret" className="max-w-30">
                Min Fret
                <div id="minFret" className="mt-2">
                  <InputWithPlusMinusButtons
                    name="minFret"
                    value={minFret}
                    onChange={setMinFret}
                    minValue={capoFret}
                    maxValue={maxFret}
                  />
                </div>
              </label>
              {/* Max Fret */}
              <label htmlFor="maxFret" className="max-w-30">
                Max Fret
                <div id="maxFret" className="mt-2">
                  <InputWithPlusMinusButtons
                    name="maxFret"
                    value={maxFret}
                    onChange={setMaxFret}
                    minValue={minFret}
                    maxValue={24}
                  />
                </div>
              </label>
            </div>
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

import { UploadCloudIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function MidiFileUpload({ name }: { name: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    if (file === undefined) return;
    setFileName(file.name);
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }

    setFileName(file.name);
  }

  // Modified from: https://tailwindflex.com/@anonymous/file-input
  return (
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
            ref={inputRef}
            type="file"
            name={name}
            className="hidden"
            accept=".mid"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
}

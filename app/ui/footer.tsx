import { GitHub } from "@deemlol/next-icons";
import styles from "@/app/styles/text-rainbow.module.scss";

export default function Footer(): React.ReactElement {
  return (
    <div className="w-full bg-black py-15 sm:py-10 text-gray-300 flex flex-wrap justify-center ">
      Crafted by
      <a href="https://github.com/shy-away">
        <div
          className={`inline ml-1 underline bg-clip-text text-transparent ${styles.bgRainbow}`}
        >
          shy-away
        </div>
        <GitHub size={16} strokeWidth={1.5} className="inline ml-1" />
      </a>
    </div>
  );
}

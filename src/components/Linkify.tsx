import { Fragment } from "react";
import { openLink } from "@/lib/utils";

const URL_REGEX = /(https?:\/\/[^\s<>"')]+[^\s<>"')\].,;:!?])/gi;

interface LinkifyProps {
  children: string | null | undefined;
  className?: string;
}

export function Linkify({ children, className }: LinkifyProps) {
  if (!children) return null;

  const parts = children.split(URL_REGEX);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <a
              key={i}
              href={part}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openLink(part);
              }}
              className="break-all text-primary underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
              rel="noopener noreferrer"
              target="_blank"
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}

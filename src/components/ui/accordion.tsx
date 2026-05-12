"use client";

import { ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

type AccordionItem = {
  id: string;
  title: string;
  content: string | ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
};

export function CmAccordion({ items, defaultOpen, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={cn("cm-accordion", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="cm-accordion__item">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${item.id}-content`}
              data-state={isOpen ? "open" : "closed"}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="cm-accordion__trigger"
            >
              <span className="cm-accordion__title">{item.title}</span>
              <span className="cm-accordion__indicator">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <div id={`${item.id}-content`} className="cm-accordion__content">
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

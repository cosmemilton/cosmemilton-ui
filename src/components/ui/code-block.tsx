"use client";

import { Check, Copy } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

export type CmCodeBlockProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  code?: string;
  children?: ReactNode;
  language?: string;
  copyable?: boolean;
  inline?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
};

export function CmCodeBlock({
  className,
  code,
  children,
  copiedLabel = "Copiado",
  copyable = false,
  copyLabel = "Copiar código",
  inline = false,
  language,
  ...props
}: CmCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const content = code ?? (typeof children === "string" ? children : "");

  async function copyCode() {
    if (!content || typeof navigator === "undefined") return;
    await navigator.clipboard?.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (inline) {
    return (
      <code className={cn("cm-code-inline", className)} {...props}>
        {children ?? code}
      </code>
    );
  }

  return (
    <figure className={cn("cm-code-block", className)} {...props}>
      {(language || copyable) ? (
        <figcaption className="cm-code-block__header">
          {language ? (
            <span className="cm-code-block__language">{language}</span>
          ) : (
            <span aria-hidden="true" />
          )}
          {copyable ? (
            <CmButton
              type="button"
              variant="ghost"
              tone="default"
              size="xs"
              shape="pill"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copyCode}
              className="cm-code-block__copy"
            >
              {copied ? copiedLabel : copyLabel}
            </CmButton>
          ) : null}
        </figcaption>
      ) : null}
      <pre className="cm-code-block__pre">
        <code className={language ? `language-${language}` : undefined}>
          {children ?? code}
        </code>
      </pre>
    </figure>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";
import { cmSizeValue } from "./types.js";

export type CmCodeBlockPreProps = HTMLAttributes<HTMLPreElement> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type CmCodeBlockProps = Omit<HTMLAttributes<HTMLElement>, "children" | "onCopy"> & {
  code?: string;
  children?: ReactNode;
  language?: string;
  copyable?: boolean;
  inline?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  copyErrorLabel?: string;
  filename?: string;
  maxHeight?: number | string;
  footer?: ReactNode;
  onCopy?: (code: string) => void;
  onCopyError?: (error: Error) => void;
  /** Native pre attributes, including keyboard access and test hooks. */
  preProps?: CmCodeBlockPreProps;
  copyButtonProps?: HTMLAttributes<HTMLButtonElement> & {
    [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
  };
};

export const CmCodeBlock = forwardRef<HTMLElement, CmCodeBlockProps>(function CmCodeBlock(
  {
    className,
    code,
    children,
    copyErrorLabel = "Não foi possível copiar",
    copiedLabel = "Copiado",
    copyable = false,
    copyLabel = "Copiar código",
    inline = false,
    language,
    filename,
    maxHeight,
    footer,
    onCopy,
    onCopyError,
    preProps,
    copyButtonProps,
    style,
    ...props
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const content = code ?? (typeof children === "string" ? children : "");
  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => {
    clearTimeout(timerRef.current);
    setCopied(false);
    setCopyError(false);
  }, [content]);

  async function copyCode() {
    if (!content) return;
    clearTimeout(timerRef.current);
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API indisponível.");
      }
      await navigator.clipboard.writeText(content);
      setCopyError(false);
      setCopied(true);
      onCopy?.(content);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      setCopied(false);
      setCopyError(true);
      onCopyError?.(error);
    }
  }

  if (inline) {
    return (
      <code ref={ref} className={cn("cm-code-inline", className)} style={style} {...props}>
        {children ?? code}
      </code>
    );
  }

  return (
    <figure
      ref={ref}
      className={cn("cm-code-block", className)}
      style={{ "--cm-code-max-height": cmSizeValue(maxHeight), ...style } as CSSProperties}
      {...props}
    >
      {language || filename || copyable ? (
        <figcaption className="cm-code-block__header">
          {language || filename ? (
            <span className="cm-code-block__identity">
              {filename ? <span className="cm-code-block__filename">{filename}</span> : null}
              {language ? <span className="cm-code-block__language">{language}</span> : null}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          {copyable ? (
            <CmButton
              {...copyButtonProps}
              type="button"
              variant="ghost"
              tone="default"
              size="xs"
              shape="pill"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copyCode}
              className={cn("cm-code-block__copy", copyButtonProps?.className)}
            >
              {copied ? copiedLabel : copyLabel}
            </CmButton>
          ) : null}
        </figcaption>
      ) : null}
      <pre
        {...preProps}
        className={cn("cm-code-block__pre", preProps?.className)}
        tabIndex={preProps?.tabIndex ?? 0}
      >
        <code className={language ? `language-${language}` : undefined}>{children ?? code}</code>
      </pre>
      {footer || copied || copyError ? (
        <figcaption className="cm-code-block__footer">
          {footer}
          {copied || copyError ? (
            <span role="status" aria-live="polite">
              {copyError ? copyErrorLabel : copiedLabel}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
});
CmCodeBlock.displayName = "CmCodeBlock";

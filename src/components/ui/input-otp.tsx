"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";

type InputOtpProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
};

export function CmInputOTP({ value, onChange, length = 6, className }: InputOtpProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const handleChange = (index: number, digit: string) => {
    const sanitized = digit.replace(/[^0-9A-Za-z]/g, "").slice(-1);
    if (!sanitized && value[index]) {
      const updated = value.split("");
      updated[index] = "";
      onChange(updated.join(""));
      return;
    }

    if (!sanitized) return;

    const updated = value.split("").concat(Array(length).fill(""));
    updated[index] = sanitized;
    const nextValue = updated.slice(0, length).join("");
    onChange(nextValue);
    const nextRef = refs.current[index + 1];
    nextRef?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index]) {
      const prevRef = refs.current[index - 1];
      prevRef?.focus();
    }
  };

  return (
    <div className={cn("cm-input-otp", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          maxLength={1}
          aria-label={`Dígito ${index + 1}`}
          title={`Dígito ${index + 1}`}
          className="cm-input-otp__digit"
        />
      ))}
    </div>
  );
}

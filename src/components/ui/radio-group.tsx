"use client";

import { ChangeEvent } from "react";
import { cn } from "../../lib/utils.js";

export type CmRadioOption = {
  value: string;
  label: string;
  description?: string;
};

export type CmRadioGroupProps = {
  name: string;
  value: string;
  options: CmRadioOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function CmRadioGroup({ name, value, options, onChange, className }: CmRadioGroupProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={cn("cm-radio-group", className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="cm-radio-group__option"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            className="cm-radio-group__input"
          />
          <span className="cm-radio-group__content">
            <span className="cm-radio-group__label">
              {option.label}
            </span>
            {option.description ? (
              <span className="cm-radio-group__description">
                {option.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

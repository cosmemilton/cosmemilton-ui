"use client";

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type InputHTMLAttributes,
} from "react";

import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

export type CmSwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "checked" | "defaultChecked" | "onChange" | "role" | "value"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
  value?: string;
  required?: boolean;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "name" | "onChange" | "type" | "value"
  >;
};

const CmSwitch = forwardRef<HTMLButtonElement, CmSwitchProps>(
  (
    {
      checked,
      className,
      defaultChecked = false,
      disabled,
      inputProps,
      name,
      onClick,
      onCheckedChange,
      required,
      style,
      value = "on",
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isChecked = checked ?? uncontrolledChecked;
    const state = isChecked ? "checked" : "unchecked";

    function setChecked(nextChecked: boolean) {
      if (checked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
    }

    return (
      <>
        <CmButton
          unstyled
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          data-state={state}
          disabled={disabled}
          className={cn("cm-switch", className)}
          style={style as CSSProperties}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented || disabled) return;
            setChecked(!isChecked);
          }}
          {...props}
        >
          <span className="cm-switch__thumb" data-state={state} />
        </CmButton>
        {name ? (
          <input
            {...inputProps}
            className={cn("cm-switch__input", inputProps?.className)}
            type="checkbox"
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            value={value}
            checked={isChecked}
            disabled={disabled}
            required={required}
            readOnly
          />
        ) : null}
      </>
    );
  },
);
CmSwitch.displayName = "CmSwitch";

export { CmSwitch };

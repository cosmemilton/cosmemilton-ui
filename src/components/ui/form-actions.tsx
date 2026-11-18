"use client";
import { CmButton } from "./button.js";
import { CmRow } from "./layout.js";

export type CmFormActionsProps = {
  formId: string;
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel: string;
  submitAriaLabel?: string;
  submitDisabled?: boolean;
};

export function CmFormActions({
  formId,
  onCancel,
  cancelLabel = "Cancelar",
  submitLabel,
  submitAriaLabel,
  submitDisabled,
}: CmFormActionsProps) {
  return (
    <CmRow fullWidth wrap justify="end" gap="sm">
      <CmButton type="button" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </CmButton>
      <CmButton
        type="submit"
        form={formId}
        tone="primary"
        disabled={submitDisabled}
        aria-label={submitAriaLabel}
      >
        {submitLabel}
      </CmButton>
    </CmRow>
  );
}
CmFormActions.displayName = "CmFormActions";

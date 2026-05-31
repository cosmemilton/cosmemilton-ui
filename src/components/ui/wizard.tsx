"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { CmButton } from "./button.js";

export type CmWizardStep = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  optional?: boolean;
  completed?: boolean;
  error?: boolean;
};

export type CmWizardOrientation = "horizontal" | "vertical";
export type CmWizardPresentation = "default" | "minimal";

export type CmWizardProps = {
  steps: CmWizardStep[];
  currentStep?: string;
  defaultStep?: string;
  onStepChange?: (stepId: string, step: CmWizardStep) => void;
  onFinish?: () => void;
  onCancel?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  nextLabel?: ReactNode;
  backLabel?: ReactNode;
  finishLabel?: ReactNode;
  cancelLabel?: ReactNode;
  showStepNumbers?: boolean;
  showSteps?: boolean;
  showPanelHeader?: boolean;
  allowStepSelect?: boolean;
  orientation?: CmWizardOrientation;
  presentation?: CmWizardPresentation;
  className?: string;
};

function findReachableStepIndex(
  steps: CmWizardStep[],
  fromIndex: number,
  direction: 1 | -1,
) {
  for (
    let index = fromIndex + direction;
    index >= 0 && index < steps.length;
    index += direction
  ) {
    if (!steps[index]?.disabled) return index;
  }

  return -1;
}

function getInitialStepId(steps: CmWizardStep[], defaultStep?: string) {
  const defaultIndex = steps.findIndex(
    (step) => step.id === defaultStep && !step.disabled,
  );
  if (defaultIndex >= 0) return steps[defaultIndex].id;

  return steps.find((step) => !step.disabled)?.id ?? steps[0]?.id ?? "";
}

export function CmWizard({
  steps,
  currentStep,
  defaultStep,
  onStepChange,
  onFinish,
  onCancel,
  canGoNext = true,
  canGoBack = true,
  nextLabel = "Próximo",
  backLabel = "Voltar",
  finishLabel = "Concluir",
  cancelLabel = "Cancelar",
  showStepNumbers = true,
  showSteps,
  showPanelHeader,
  allowStepSelect = true,
  orientation = "horizontal",
  presentation = "default",
  className,
}: CmWizardProps) {
  const titleId = useId();
  const [internalStep, setInternalStep] = useState(() =>
    getInitialStepId(steps, defaultStep),
  );

  const activeIndex = useMemo(() => {
    const selectedId = currentStep ?? internalStep;
    const selectedIndex = steps.findIndex(
      (step) => step.id === selectedId && !step.disabled,
    );
    if (selectedIndex >= 0) return selectedIndex;

    const firstEnabledIndex = steps.findIndex((step) => !step.disabled);
    return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
  }, [currentStep, internalStep, steps]);

  const activeStep = steps[activeIndex];
  if (!activeStep) return null;

  const previousIndex = findReachableStepIndex(steps, activeIndex, -1);
  const nextIndex = findReachableStepIndex(steps, activeIndex, 1);
  const isLastReachableStep = nextIndex === -1;
  const isControlled = currentStep !== undefined;
  const cannotInteract = Boolean(activeStep.disabled);
  const backDisabled = cannotInteract || !canGoBack || previousIndex === -1;
  const primaryDisabled =
    cannotInteract || !canGoNext || (!isLastReachableStep && nextIndex === -1);
  const renderSteps = showSteps ?? presentation !== "minimal";
  const renderPanelHeader = showPanelHeader ?? presentation !== "minimal";
  const renderBackButton = presentation !== "minimal" || previousIndex !== -1;

  const setActiveStep = (index: number) => {
    const nextStep = steps[index];
    if (!nextStep || nextStep.disabled) return;

    if (!isControlled) {
      setInternalStep(nextStep.id);
    }
    onStepChange?.(nextStep.id, nextStep);
  };

  const handlePrimaryAction = () => {
    if (primaryDisabled) return;
    if (isLastReachableStep) {
      onFinish?.();
      return;
    }
    setActiveStep(nextIndex);
  };

  return (
    <div
      className={cn(
        "cm-wizard",
        `cm-wizard--${orientation}`,
        `cm-wizard--${presentation}`,
        className,
      )}
    >
      {renderSteps ? (
        <nav className="cm-wizard__steps" aria-label="Etapas">
          <ol className="cm-wizard__list">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              const isSelectable = allowStepSelect && !step.disabled;
              const status = step.error
                ? "error"
                : step.disabled
                  ? "pending"
                  : step.completed || index < activeIndex
                    ? "completed"
                    : isActive
                      ? "current"
                      : "pending";
              const stepClassName = cn(
                "cm-wizard__step",
                `cm-wizard__step--${status}`,
                isActive && "cm-wizard__step--active",
                step.disabled && "cm-wizard__step--disabled",
                isSelectable && "cm-wizard__step--selectable",
              );
              const marker = (
                <span className="cm-wizard__step-marker" aria-hidden="true">
                  {status === "completed" ? (
                    <Check className="cm-wizard__step-icon" />
                  ) : status === "error" ? (
                    <AlertCircle className="cm-wizard__step-icon" />
                  ) : showStepNumbers ? (
                    index + 1
                  ) : null}
                </span>
              );
              const content = (
                <>
                  {marker}
                  <span className="cm-wizard__step-copy">
                    <span className="cm-wizard__step-title">
                      {step.title}
                      {step.optional ? (
                        <span className="cm-wizard__optional">Opcional</span>
                      ) : null}
                    </span>
                    {step.description ? (
                      <span className="cm-wizard__step-description">
                        {step.description}
                      </span>
                    ) : null}
                  </span>
                </>
              );

              return (
                <li key={step.id} className="cm-wizard__item">
                  {isSelectable ? (
                    <CmButton
                      unstyled
                      type="button"
                      className={stepClassName}
                      aria-current={isActive ? "step" : undefined}
                      onClick={() => setActiveStep(index)}
                    >
                      {content}
                    </CmButton>
                  ) : (
                    <div
                      className={stepClassName}
                      aria-current={isActive ? "step" : undefined}
                      aria-disabled={step.disabled || undefined}
                    >
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <section
        className="cm-wizard__panel"
        aria-labelledby={renderPanelHeader ? titleId : undefined}
        aria-label={!renderPanelHeader ? "Fluxo por etapas" : undefined}
      >
        {renderPanelHeader ? (
          <div className="cm-wizard__panel-header">
            {showStepNumbers ? (
              <span className="cm-wizard__eyebrow">
                Etapa {activeIndex + 1} de {steps.length}
              </span>
            ) : null}
            <h3 id={titleId} className="cm-wizard__panel-title">
              {activeStep.title}
            </h3>
            {activeStep.description ? (
              <p className="cm-wizard__panel-description">
                {activeStep.description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="cm-wizard__body">{activeStep.content}</div>

        <div className="cm-wizard__actions">
          {onCancel ? (
            <CmButton variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </CmButton>
          ) : null}
          <div className="cm-wizard__actions-main">
            {renderBackButton ? (
              <CmButton
                variant="outline"
                onClick={() => setActiveStep(previousIndex)}
                disabled={backDisabled}
              >
                {backLabel}
              </CmButton>
            ) : null}
            <CmButton
              tone="primary"
              onClick={handlePrimaryAction}
              disabled={primaryDisabled}
            >
              {isLastReachableStep ? finishLabel : nextLabel}
            </CmButton>
          </div>
        </div>
      </section>
    </div>
  );
}
CmWizard.displayName = "CmWizard";

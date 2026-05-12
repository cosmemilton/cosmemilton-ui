"use client";

import { useEffect, useState } from "react";
import { CmDialog } from "./dialog";
import { CmProgress } from "./progress";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "pending" | "loading" | "completed" | "error";
  detail?: string;
}

interface ProgressModalProps {
  open: boolean;
  steps: Step[];
  currentStep?: string;
  title?: string;
  description?: string;
}

export function CmProgressModal({
  open,
  steps,
  currentStep,
  title = "Processando...",
  description = "Por favor, aguarde enquanto processamos sua solicitação.",
}: ProgressModalProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <CmDialog open={open} onClose={() => {}}>
      <div className="cm-progress-modal__overlay">
        <div className="cm-progress-modal__panel">
          {/* Header */}
          <div className="cm-progress-modal__header">
            <h2 className="cm-progress-modal__title">{title}</h2>
            <p className="cm-progress-modal__description">
              {description}
            </p>
          </div>

          {/* CmProgress Bar */}
          <div className="cm-progress-modal__progress">
            <div className="cm-progress-modal__progress-header">
              <span className="cm-progress-modal__muted">
                Progresso
              </span>
              <span className="cm-progress-modal__count">
                {completedSteps} de {totalSteps}
              </span>
            </div>
            <CmProgress value={progress} className="cm-progress-modal__bar" />
          </div>

          {/* Steps List */}
          <div className="cm-progress-modal__steps">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="cm-progress-modal__step"
                style={{
                  opacity: step.status === "pending" ? 0.5 : 1,
                }}
              >
                {/* CmIcon */}
                <div className="cm-progress-modal__status">
                  {step.status === "completed" && (
                    <CheckCircle2 className="cm-progress-modal__status-icon cm-progress-modal__status-icon--completed" />
                  )}
                  {step.status === "loading" && (
                    <Loader2 className="cm-progress-modal__status-icon cm-progress-modal__status-icon--loading" />
                  )}
                  {step.status === "pending" && (
                    <div className="cm-progress-modal__status-dot cm-progress-modal__status-dot--pending" />
                  )}
                  {step.status === "error" && (
                    <div className="cm-progress-modal__status-dot cm-progress-modal__status-dot--error" />
                  )}
                </div>

                {/* Content */}
                <div className="cm-progress-modal__step-content">
                  <p
                    className={`cm-progress-modal__step-label ${
                      step.status === "loading"
                        ? "cm-progress-modal__step-label--loading"
                        : step.status === "completed"
                          ? "cm-progress-modal__step-label--completed"
                          : "cm-progress-modal__step-label--default"
                    }`}
                  >
                    {step.label}
                    {step.status === "loading" && step.detail && (
                      <span className="cm-progress-modal__detail">
                        — {step.detail}
                      </span>
                    )}
                  </p>
                </div>

                {/* Step Number */}
                <div className="cm-progress-modal__step-number">
                  <span className="cm-progress-modal__muted">
                    {index + 1}/{totalSteps}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="cm-progress-modal__note">
            <p className="cm-progress-modal__note-text">
              <strong>Importante:</strong> Não feche esta janela. Este processo
              pode levar alguns segundos.
            </p>
          </div>
        </div>
      </div>
    </CmDialog>
  );
}

import { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function CmForm({ title, description, actions, className, children, ...props }: FormProps) {
  return (
    <form
      className={cn(
        "cm-form",
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <header className="cm-form__header">
          {title ? (
            <h2 className="cm-form__title">{title}</h2>
          ) : null}
          {description ? (
            <p className="cm-form__description">{description}</p>
          ) : null}
        </header>
      )}
      <div className="cm-form__body">{children}</div>
      {actions ? <footer className="cm-form__actions">{actions}</footer> : null}
    </form>
  );
}

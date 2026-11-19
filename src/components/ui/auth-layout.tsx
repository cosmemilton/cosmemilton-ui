import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmRow, CmStack } from "./layout.js";
import { CmText } from "./text.js";

export type CmAuthLayoutProps = {
  layout?: "centered" | "split";
  appearance?: "plain" | "glass";
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  brand?: { title: string; icon?: ReactNode };
  actions?: ReactNode;
  footer?: ReactNode;
  backgroundImage?: string;
  artworkImage?: string;
  className?: string;
  children: ReactNode;
};

type CmAuthLayoutStyle = CSSProperties & {
  "--cm-auth-background-image"?: string;
  "--cm-auth-artwork-image"?: string;
};

export function CmAuthLayout({
  layout = "centered",
  appearance = "plain",
  title,
  description,
  eyebrow,
  icon,
  brand,
  actions,
  footer,
  backgroundImage,
  artworkImage,
  className,
  children,
}: CmAuthLayoutProps) {
  const titleId = useId();
  const split = layout === "split";
  const images: CmAuthLayoutStyle = {
    "--cm-auth-background-image": backgroundImage
      ? `url(${JSON.stringify(backgroundImage)})`
      : undefined,
    "--cm-auth-artwork-image": artworkImage ? `url(${JSON.stringify(artworkImage)})` : undefined,
  };

  const header =
    brand || actions ? (
      <CmRow as="header" className="cm-auth__header" align="center" justify="between" gap="md" wrap>
        {brand && (
          <CmRow className="cm-auth__brand" align="center" gap="sm">
            {brand.icon && (
              <CmRow as="span" className="cm-auth__brand-mark" aria-hidden="true">
                {brand.icon}
              </CmRow>
            )}
            <CmText
              as="span"
              size="lg"
              weight="extrabold"
              family="heading"
              tracking="tight"
              spacing="none"
            >
              {brand.title}
            </CmText>
          </CmRow>
        )}
        {actions}
      </CmRow>
    ) : null;

  return (
    <CmStack
      className={cn(
        "cm-auth",
        `cm-auth--${layout}`,
        `cm-auth--${appearance}`,
        backgroundImage && "cm-auth--with-background",
        className,
      )}
      style={images}
    >
      <CmStack className="cm-auth__workspace">
        {!split && header}
        <CmStack as="main" className="cm-auth__content" aria-labelledby={titleId}>
          <CmStack className="cm-auth__panel" gap="xl">
            {split && header}
            <CmStack gap="sm">
              {icon && (
                <CmRow as="span" className="cm-auth__title-icon" aria-hidden="true">
                  {icon}
                </CmRow>
              )}
              {eyebrow && (
                <CmText
                  as="span"
                  className="cm-auth__eyebrow"
                  size="xs"
                  weight="bold"
                  spacing="none"
                >
                  {eyebrow}
                </CmText>
              )}
              <CmText
                as="h1"
                id={titleId}
                className="cm-auth__title"
                family="heading"
                weight="extrabold"
                spacing="none"
              >
                {title}
              </CmText>
              {description && (
                <CmText tone="muted" spacing="none" wrap="pretty">
                  {description}
                </CmText>
              )}
            </CmStack>
            {children}
            {footer && (
              <CmStack as="footer" className="cm-auth__footer" gap="sm">
                {footer}
              </CmStack>
            )}
          </CmStack>
        </CmStack>
      </CmStack>
      {split && <CmStack className="cm-auth__illustration" aria-hidden="true" />}
    </CmStack>
  );
}

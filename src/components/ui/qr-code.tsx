"use client";

import { forwardRef, type SVGProps } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../../lib/utils.js";

export type CmQrCodeProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "dangerouslySetInnerHTML" | "width" | "height" | "viewBox" | "ref"
> & {
  /** Conteúdo completo a codificar, sem normalização de URL ou remoção de espaços. */
  value: string;
  /** Lado do SVG em pixels. Padrão: `192`. A largura se adapta ao contêiner. */
  size?: number;
  /** Nível mínimo de correção de erros. Padrão: `"M"`. */
  level?: "L" | "M" | "Q" | "H";
  /** Nome acessível do QR Code. Padrão: `"QR Code"`. */
  title?: string;
};

/** QR Code vetorial gerado localmente, com contraste e margem de leitura preservados. */
export const CmQrCode = forwardRef<SVGSVGElement, CmQrCodeProps>(function CmQrCode(
  { value, size = 192, level = "M", title = "QR Code", className, ...rest },
  ref,
) {
  return (
    <QRCodeSVG
      role="img"
      {...rest}
      ref={ref}
      className={cn("cm-qr-code", className)}
      value={value}
      size={size}
      level={level}
      title={title}
      marginSize={4}
      bgColor="#ffffff"
      fgColor="#000000"
    />
  );
});

CmQrCode.displayName = "CmQrCode";

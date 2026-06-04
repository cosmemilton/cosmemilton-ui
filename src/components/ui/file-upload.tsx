"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";

export type CmFileUploadRejectionReason = "type" | "size" | "count";

export type CmFileUploadRejection = {
  file: File;
  reason: CmFileUploadRejectionReason;
};

export type CmFileUploadProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  /** `accept` no formato do `<input type="file">` (mime ou extensões): `"image/*,.pdf"`. */
  accept?: string;
  multiple?: boolean;
  /** Tamanho máximo por arquivo, em bytes. Maiores são rejeitados com motivo `"size"`. */
  maxSize?: number;
  /** Quantidade máxima de arquivos mantidos. O excedente é rejeitado com motivo `"count"`. */
  maxFiles?: number;
  disabled?: boolean;
  /** Texto principal da zona de soltar. */
  label?: ReactNode;
  /** Linha auxiliar abaixo do label (ex.: "PNG ou JPG até 5 MB"). */
  hint?: ReactNode;
  /** Nome acessível da zona de soltar. Padrão derivado de `label` (se string). */
  ariaLabel?: string;
  /** Lista controlada de arquivos. */
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Disparado com os arquivos recém-aceitos a cada adição. */
  onUpload?: (files: File[]) => void;
  /** Disparado quando arquivos são rejeitados por tipo/tamanho/quantidade. */
  onReject?: (rejections: CmFileUploadRejection[]) => void;
  /** Exibe a lista de previews abaixo da zona. Padrão: `true`. */
  showPreview?: boolean;
};

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const i = Math.min(SIZE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${SIZE_UNITS[i]}`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, token.indexOf("/") + 1));
    return type === token;
  });
}

const isImage = (file: File) => file.type.startsWith("image/");

export const CmFileUpload = forwardRef<HTMLDivElement, CmFileUploadProps>(function CmFileUpload(
  {
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    disabled = false,
    label,
    hint,
    ariaLabel,
    value,
    defaultValue,
    onChange,
    onUpload,
    onReject,
    showPreview = true,
    className,
    ...rest
  },
  ref,
) {
  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<(string | null)[]>([]);

  // Keep latest callbacks in refs so addFiles isn't recreated by their identity.
  const onUploadRef = useRef(onUpload);
  onUploadRef.current = onUpload;
  const onRejectRef = useRef(onReject);
  onRejectRef.current = onReject;

  // Object URLs for image thumbnails — created per file list, revoked on change.
  useEffect(() => {
    const urls = files.map((file) => (isImage(file) ? URL.createObjectURL(file) : null));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [files]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;

      const accepted: File[] = [];
      const rejections: CmFileUploadRejection[] = [];
      for (const file of incoming) {
        if (!matchesAccept(file, accept)) {
          rejections.push({ file, reason: "type" });
          continue;
        }
        if (maxSize != null && file.size > maxSize) {
          rejections.push({ file, reason: "size" });
          continue;
        }
        accepted.push(file);
      }

      const base = multiple ? files : [];
      let combined = multiple ? [...base, ...accepted] : accepted.slice(-1);
      if (multiple && maxFiles != null && combined.length > maxFiles) {
        combined.slice(maxFiles).forEach((file) => rejections.push({ file, reason: "count" }));
        combined = combined.slice(0, maxFiles);
      }
      const added = combined.slice(base.length);

      if (added.length > 0) {
        setFiles(combined);
        onUploadRef.current?.(added);
      }
      if (rejections.length > 0) onRejectRef.current?.(rejections);
    },
    [accept, disabled, files, maxFiles, maxSize, multiple, setFiles],
  );

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const removeAt = useCallback(
    (index: number) => {
      setFiles(files.filter((_, i) => i !== index));
    },
    [files, setFiles],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled) return;
    addFiles(Array.from(event.dataTransfer.files));
  };

  const dropzoneLabel = ariaLabel ?? (typeof label === "string" ? label : "Enviar arquivos");

  return (
    <div ref={ref} className={cn("cm-file-upload", className)} {...rest}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={dropzoneLabel}
        className={cn(
          "cm-file-upload__dropzone",
          isDragging && "cm-file-upload__dropzone--dragging",
          disabled && "cm-file-upload__dropzone--disabled",
        )}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className="cm-file-upload__icon" aria-hidden />
        <span className="cm-file-upload__text">
          <span className="cm-file-upload__label">
            {label ?? "Arraste arquivos aqui ou clique para enviar"}
          </span>
          {hint ? <span className="cm-file-upload__hint">{hint}</span> : null}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="cm-file-upload__input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {showPreview && files.length > 0 ? (
        <ul className="cm-file-upload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="cm-file-upload__item">
              {previews[index] ? (
                <img src={previews[index]!} alt="" className="cm-file-upload__thumb" />
              ) : (
                <span className="cm-file-upload__thumb cm-file-upload__thumb--icon">
                  <FileIcon aria-hidden />
                </span>
              )}
              <span className="cm-file-upload__meta">
                <span className="cm-file-upload__name" title={file.name}>
                  {file.name}
                </span>
                <span className="cm-file-upload__size">{formatFileSize(file.size)}</span>
              </span>
              <button
                type="button"
                className="cm-file-upload__remove"
                aria-label={`Remover ${file.name}`}
                onClick={() => removeAt(index)}
                disabled={disabled}
              >
                <X aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
CmFileUpload.displayName = "CmFileUpload";

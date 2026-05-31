"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import { CmButton } from "./button.js";
import { cn } from "../../lib/utils.js";

type PaginationMode = "pages" | "compact";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  mode?: PaginationMode;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  summary?: ReactNode;
  className?: string;
};

export const CmPagination = forwardRef<HTMLDivElement, PaginationProps>(
  function CmPagination(
    {
      page,
      totalPages,
      onChange,
      siblingCount = 1,
      mode = "pages",
      previousLabel = "Anterior",
      nextLabel = "Próximo",
      summary,
      className,
    },
    ref,
  ) {
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);
  const isCompact = mode === "compact";
  const pages = useMemo(() => {
    const start = Math.max(1, currentPage - siblingCount);
    const end = Math.min(safeTotalPages, currentPage + siblingCount);
    const range: Array<number | string> = [];

    if (start > 1) {
      range.push(1);
      if (start > 2) range.push("...");
    }

    for (let current = start; current <= end; current += 1) {
      range.push(current);
    }

    if (end < safeTotalPages) {
      if (end < safeTotalPages - 1) range.push("...");
      range.push(safeTotalPages);
    }

    return range;
  }, [currentPage, safeTotalPages, siblingCount]);

  return (
    <div ref={ref} className={cn("cm-pagination", isCompact && "cm-pagination--compact", className)}>
      <CmButton
        variant="outline"
        size={isCompact ? "sm" : "md"}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        {previousLabel}
      </CmButton>
      {isCompact ? (
        <span className="cm-pagination__summary">
          {summary ?? <>Página {currentPage} de {safeTotalPages}</>}
        </span>
      ) : (
        <div className="cm-pagination__pages">
          {pages.map((entry, index) =>
            typeof entry === "number" ? (
              <CmButton
                unstyled
                key={entry}
                type="button"
                onClick={() => onChange(entry)}
                aria-current={entry === currentPage ? "page" : undefined}
                className={cn(
                  "cm-pagination__page",
                  entry === currentPage && "cm-pagination__page--current",
                )}
              >
                {entry}
              </CmButton>
            ) : (
              <span key={`ellipsis-${index}`} className="cm-pagination__ellipsis">
                {entry}
              </span>
            ),
          )}
        </div>
      )}
      <CmButton
        variant="outline"
        size={isCompact ? "sm" : "md"}
        onClick={() => onChange(Math.min(safeTotalPages, currentPage + 1))}
        disabled={currentPage === safeTotalPages}
      >
        {nextLabel}
      </CmButton>
    </div>
  );
});
CmPagination.displayName = "CmPagination";

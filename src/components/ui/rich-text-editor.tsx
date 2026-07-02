"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useControllableState } from "../../hooks/use-controllable-state.js";

export type CmRichTextCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "link"
  | "unlink"
  | "clear"
  | "undo"
  | "redo";

export type CmRichTextToolbarItem = CmRichTextCommand | "separator";

/** API imperativa do editor, exposta via prop `editorApiRef`. */
export type CmRichTextEditorHandle = {
  /** Foca a área editável, restaurando a última seleção conhecida. */
  focus: () => void;
  /** Insere texto puro na posição do cursor. */
  insertText: (text: string) => void;
  /** Insere HTML na posição do cursor. */
  insertHtml: (html: string) => void;
  /** Executa um comando `document.execCommand` arbitrário no editor. */
  exec: (command: string, arg?: string) => void;
};

export type CmRichTextEditorProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  /** HTML controlado do conteúdo. */
  value?: string;
  /** HTML inicial quando não controlado. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Botões da toolbar (e `"separator"`). `false` esconde a toolbar. */
  toolbar?: CmRichTextToolbarItem[] | false;
  /**
   * Conteúdo extra no início da toolbar (ex.: botão de emoji, menções).
   * Mantém a toolbar visível mesmo com `toolbar={false}`.
   */
  toolbarStart?: ReactNode;
  /** Conteúdo extra no fim da toolbar. Mesmo comportamento de `toolbarStart`. */
  toolbarEnd?: ReactNode;
  /** Ref da API imperativa (`insertText`/`insertHtml`/`exec`/`focus`). */
  editorApiRef?: Ref<CmRichTextEditorHandle>;
  /** Nome acessível da área editável. */
  ariaLabel?: string;
  minHeight?: number | string;
  /** Cola apenas texto puro (markup limpo/seguro). Padrão: `true`. */
  pastePlainText?: boolean;
  /** Fonte da URL ao inserir link. Padrão: `window.prompt`. */
  onLinkRequest?: () => string | null;
};

export const CM_RICH_TEXT_DEFAULT_TOOLBAR: CmRichTextToolbarItem[] = [
  "bold",
  "italic",
  "underline",
  "strike",
  "separator",
  "h1",
  "h2",
  "h3",
  "paragraph",
  "separator",
  "bulletList",
  "orderedList",
  "blockquote",
  "separator",
  "link",
  "unlink",
  "clear",
  "separator",
  "undo",
  "redo",
];

const COMMAND_META: Record<CmRichTextCommand, { label: string; Icon: LucideIcon }> = {
  bold: { label: "Negrito", Icon: Bold },
  italic: { label: "Itálico", Icon: Italic },
  underline: { label: "Sublinhado", Icon: Underline },
  strike: { label: "Tachado", Icon: Strikethrough },
  paragraph: { label: "Parágrafo", Icon: Pilcrow },
  h1: { label: "Título 1", Icon: Heading1 },
  h2: { label: "Título 2", Icon: Heading2 },
  h3: { label: "Título 3", Icon: Heading3 },
  bulletList: { label: "Lista com marcadores", Icon: List },
  orderedList: { label: "Lista numerada", Icon: ListOrdered },
  blockquote: { label: "Citação", Icon: Quote },
  link: { label: "Inserir link", Icon: Link2 },
  unlink: { label: "Remover link", Icon: Unlink },
  clear: { label: "Limpar formatação", Icon: RemoveFormatting },
  undo: { label: "Desfazer", Icon: Undo2 },
  redo: { label: "Refazer", Icon: Redo2 },
};

// Commands whose pressed state we can reflect via the Selection/exec model.
const TOGGLEABLE: ReadonlySet<CmRichTextCommand> = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "h1",
  "h2",
  "h3",
  "bulletList",
  "orderedList",
  "blockquote",
]);

type EditorStyle = CSSProperties & Record<"--cm-rte-min-height", string>;

export const CmRichTextEditor = forwardRef<HTMLDivElement, CmRichTextEditorProps>(
  function CmRichTextEditor(
    {
      value,
      defaultValue,
      onChange,
      placeholder,
      disabled = false,
      readOnly = false,
      toolbar = CM_RICH_TEXT_DEFAULT_TOOLBAR,
      toolbarStart,
      toolbarEnd,
      editorApiRef,
      ariaLabel,
      minHeight = "8rem",
      pastePlainText = true,
      onLinkRequest,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const [html, setHtml] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange,
    });

    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const lastHtmlRef = useRef<string>(html ?? "");
    const activeKeyRef = useRef<string>("");
    const [activeCommands, setActiveCommands] = useState<Set<CmRichTextCommand>>(new Set());

    const editable = !disabled && !readOnly;

    // Sync external/initial HTML into the contentEditable node without clobbering
    // the caret while typing: only write when the live DOM actually differs.
    useEffect(() => {
      const el = editorRef.current;
      if (!el) return;
      const next = html ?? "";
      if (el.innerHTML !== next) {
        el.innerHTML = next;
        lastHtmlRef.current = next;
      }
    }, [html]);

    const updateActive = useCallback(() => {
      if (typeof document === "undefined") return;
      const queryState = (command: string) => {
        try {
          return document.queryCommandState(command);
        } catch {
          return false;
        }
      };
      let block = "";
      try {
        block = (document.queryCommandValue("formatBlock") || "").toString().toLowerCase();
      } catch {
        block = "";
      }
      const next = new Set<CmRichTextCommand>();
      if (queryState("bold")) next.add("bold");
      if (queryState("italic")) next.add("italic");
      if (queryState("underline")) next.add("underline");
      if (queryState("strikeThrough")) next.add("strike");
      if (queryState("insertUnorderedList")) next.add("bulletList");
      if (queryState("insertOrderedList")) next.add("orderedList");
      if (block === "h1") next.add("h1");
      if (block === "h2") next.add("h2");
      if (block === "h3") next.add("h3");
      if (block === "blockquote") next.add("blockquote");

      const key = [...next].sort().join(",");
      if (key !== activeKeyRef.current) {
        activeKeyRef.current = key;
        setActiveCommands(next);
      }
    }, []);

    const syncFromDom = useCallback(() => {
      const current = editorRef.current?.innerHTML ?? "";
      lastHtmlRef.current = current;
      setHtml(current);
      updateActive();
    }, [setHtml, updateActive]);

    const exec = useCallback(
      (command: string, arg?: string) => {
        editorRef.current?.focus();
        try {
          document.execCommand(command, false, arg);
        } catch {
          /* execCommand unsupported (e.g. jsdom) — value sync still runs */
        }
        syncFromDom();
      },
      [syncFromDom],
    );

    // Devolve foco e cursor ao editor antes de comandos imperativos: restaura
    // o último Range salvo ou colapsa o caret no fim do conteúdo.
    const restoreSelection = useCallback(() => {
      const el = editorRef.current;
      if (!el || typeof document === "undefined") return;
      const selection = document.getSelection();
      const selectionInEditor =
        document.activeElement === el && !!selection?.anchorNode && el.contains(selection.anchorNode);
      if (selectionInEditor) return;
      el.focus();
      if (!selection) return;
      try {
        const saved = savedRangeRef.current;
        let range: Range;
        if (saved && el.contains(saved.commonAncestorContainer)) {
          range = saved;
        } else {
          range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
        }
        selection.removeAllRanges();
        selection.addRange(range);
      } catch {
        /* Selection/Range parcial (e.g. jsdom) — o foco já basta */
      }
    }, []);

    useImperativeHandle(
      editorApiRef,
      () => ({
        focus: () => restoreSelection(),
        insertText: (text: string) => {
          restoreSelection();
          exec("insertText", text);
        },
        insertHtml: (markup: string) => {
          restoreSelection();
          exec("insertHTML", markup);
        },
        exec: (command: string, arg?: string) => {
          restoreSelection();
          exec(command, arg);
        },
      }),
      [exec, restoreSelection],
    );

    const applyLink = useCallback(() => {
      const url = onLinkRequest
        ? onLinkRequest()
        : typeof window !== "undefined"
          ? window.prompt("URL do link:")
          : null;
      if (url) exec("createLink", url);
    }, [exec, onLinkRequest]);

    const runCommand = useCallback(
      (command: CmRichTextCommand) => {
        switch (command) {
          case "bold":
            return exec("bold");
          case "italic":
            return exec("italic");
          case "underline":
            return exec("underline");
          case "strike":
            return exec("strikeThrough");
          case "paragraph":
            return exec("formatBlock", "<p>");
          case "h1":
            return exec("formatBlock", "<h1>");
          case "h2":
            return exec("formatBlock", "<h2>");
          case "h3":
            return exec("formatBlock", "<h3>");
          case "bulletList":
            return exec("insertUnorderedList");
          case "orderedList":
            return exec("insertOrderedList");
          case "blockquote":
            return exec("formatBlock", "<blockquote>");
          case "link":
            return applyLink();
          case "unlink":
            return exec("unlink");
          case "clear":
            return exec("removeFormat");
          case "undo":
            return exec("undo");
          case "redo":
            return exec("redo");
        }
      },
      [exec, applyLink],
    );

    // Reflect toolbar pressed-state as the selection moves inside the editor.
    useEffect(() => {
      if (!editable || typeof document === "undefined") return;
      const handler = () => {
        const el = editorRef.current;
        const selection = document.getSelection();
        if (el && selection?.anchorNode && el.contains(selection.anchorNode)) {
          // Guarda a seleção para a API imperativa restaurar o cursor depois
          // que o foco sair do editor (ex.: clique num botão de emoji).
          if (selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
          }
          updateActive();
        }
      };
      document.addEventListener("selectionchange", handler);
      return () => document.removeEventListener("selectionchange", handler);
    }, [editable, updateActive]);

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
      if (!pastePlainText) return;
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      exec("insertText", text);
    };

    const editorStyle: EditorStyle = {
      "--cm-rte-min-height": typeof minHeight === "number" ? `${minHeight}px` : minHeight,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "cm-rte",
          disabled && "cm-rte--disabled",
          readOnly && "cm-rte--readonly",
          className,
        )}
        style={style}
        {...rest}
      >
        {editable && (toolbar !== false || toolbarStart != null || toolbarEnd != null) ? (
          <div className="cm-rte__toolbar" role="toolbar" aria-label="Formatação de texto">
            {toolbarStart != null ? (
              <span className="cm-rte__toolbar-slot">{toolbarStart}</span>
            ) : null}
            {toolbar !== false
              ? toolbar.map((item, index) => {
                  if (item === "separator") {
                    return (
                      <span
                        key={`sep-${index}`}
                        className="cm-rte__separator"
                        role="separator"
                        aria-orientation="vertical"
                      />
                    );
                  }
                  const meta = COMMAND_META[item];
                  const isActive = activeCommands.has(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={cn("cm-rte__tool", isActive && "cm-rte__tool--active")}
                      aria-label={meta.label}
                      aria-pressed={TOGGLEABLE.has(item) ? isActive : undefined}
                      title={meta.label}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => runCommand(item)}
                    >
                      <meta.Icon size={16} aria-hidden />
                    </button>
                  );
                })
              : null}
            {toolbarEnd != null ? <span className="cm-rte__toolbar-slot">{toolbarEnd}</span> : null}
          </div>
        ) : null}

        <div
          ref={editorRef}
          className="cm-rte__content"
          contentEditable={editable}
          suppressContentEditableWarning
          role="textbox"
          tabIndex={disabled ? -1 : 0}
          aria-multiline="true"
          aria-label={ariaLabel ?? placeholder ?? "Editor de texto"}
          aria-readonly={!editable || undefined}
          data-placeholder={placeholder}
          spellCheck
          style={editorStyle}
          onInput={syncFromDom}
          onBlur={syncFromDom}
          onKeyUp={updateActive}
          onMouseUp={updateActive}
          onPaste={handlePaste}
        />
      </div>
    );
  },
);
CmRichTextEditor.displayName = "CmRichTextEditor";

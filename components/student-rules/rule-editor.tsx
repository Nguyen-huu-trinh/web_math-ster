"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Bold } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RuleEditorProps {
  initialTitle?: string;
  initialContent?: string;

  onSave: (
    title: string,
    content: string
  ) => Promise<void>;

  onCancel: () => void;

  saving?: boolean;
}

export default function RuleEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  onCancel,
  saving = false,
}: RuleEditorProps) {
  const editorRef =
    useRef<HTMLDivElement>(null);

  const [title, setTitle] =
    useState(initialTitle);

  const [fontSize, setFontSize] =
    useState("16px");

  const [content, setContent] =
    useState(initialContent);

  /*
   * Đưa nội dung ban đầu vào editor
   * chỉ khi component được mở.
   */
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.innerHTML =
      initialContent;
  }, [initialContent]);

  function syncContent() {
    const html =
      editorRef.current?.innerHTML ?? "";

    setContent(html);
  }

  function toggleBold() {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    document.execCommand(
      "bold",
      false
    );

    syncContent();
  }

  function changeFontSize(
    size: string
  ) {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    document.execCommand(
      "fontSize",
      false,
      "7"
    );

    const elements =
      editorRef.current.querySelectorAll(
        'font[size="7"]'
      );

    elements.forEach(
      (element) => {
        const el =
          element as HTMLElement;

        el.removeAttribute("size");

        el.style.fontSize = size;
      }
    );

    setFontSize(size);

    syncContent();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "b"
    ) {
      event.preventDefault();

      toggleBold();
    }
  }

async function handleSave() {
  const cleanTitle =
    title.trim();

  if (!cleanTitle) {
    return;
  }

  if (!editorRef.current) {
    return;
  }

  autoLinkUrls();

  const cleanContent =
    editorRef.current.innerHTML.trim();

  if (!cleanContent) {
    return;
  }

  await onSave(
    cleanTitle,
    cleanContent
  );
}

function autoLinkUrls() {
  const editor = editorRef.current;

  if (!editor) {
    return;
  }

  const walker =
    document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT
    );

  const textNodes: Text[] = [];

  let node: Node | null;

  while (
    (node = walker.nextNode())
  ) {
    const textNode = node as Text;

    /*
     * Nếu text đang nằm bên trong <a>
     * thì không xử lý lại.
     */
    const parentElement =
      textNode.parentElement;

    if (
      parentElement?.closest("a")
    ) {
      continue;
    }

    textNodes.push(textNode);
  }

  const urlRegex =
    /https?:\/\/[^\s<>"']+/g;

  textNodes.forEach((textNode) => {
    const text =
      textNode.textContent ?? "";

    if (!urlRegex.test(text)) {
      urlRegex.lastIndex = 0;
      return;
    }

    urlRegex.lastIndex = 0;

    const fragment =
      document.createDocumentFragment();

    let lastIndex = 0;

    text.replace(
      urlRegex,
      (
        matchedUrl,
        offset: number
      ) => {
        /*
         * Phần text trước URL
         */
        fragment.appendChild(
          document.createTextNode(
            text.slice(
              lastIndex,
              offset
            )
          )
        );

        /*
         * Tạo link
         */
        const link =
          document.createElement("a");

        link.href = matchedUrl;
        link.textContent =
          matchedUrl;

        link.target = "_blank";

        link.rel =
          "noopener noreferrer";

        link.className =
          "text-blue-600 underline";

        fragment.appendChild(link);

        lastIndex =
          offset + matchedUrl.length;

        return matchedUrl;
      }
    );

    /*
     * Phần text sau URL
     */
    fragment.appendChild(
      document.createTextNode(
        text.slice(lastIndex)
      )
    );

    textNode.parentNode?.replaceChild(
      fragment,
      textNode
    );
  });

  syncContent();
}
  return (
    <div className="space-y-4">

      {/* =========================
          ĐỀ MỤC
      ========================== */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Đề mục
        </label>

        <input
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Nhập đề mục nội quy..."
          disabled={saving}
          className="
            w-full
            rounded-md
            border
            bg-background
            px-3
            py-2
            text-sm
            outline-none
            transition
            focus:ring-2
            focus:ring-primary/30
          "
        />
      </div>

      {/* =========================
          NỘI DUNG
      ========================== */}
      <div className="space-y-2">

        <label className="text-sm font-medium">
          Nội dung
        </label>

        {/* TOOLBAR */}
        <div className="
          flex
          flex-wrap
          items-center
          gap-2
          rounded-t-md
          border
          border-b-0
          bg-muted/40
          p-2
        ">

          {/* BOLD */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleBold}
            disabled={saving}
            title="In đậm (Ctrl + B)"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>

          {/* FONT SIZE */}
          <Select
            value={fontSize}
            onValueChange={(value) => {
              if (value) {
                changeFontSize(value);
              }
            }}
            disabled={saving}
          >
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="14px">
                14 px
              </SelectItem>

              <SelectItem value="16px">
                16 px
              </SelectItem>

              <SelectItem value="18px">
                18 px
              </SelectItem>

              <SelectItem value="20px">
                20 px
              </SelectItem>

              <SelectItem value="24px">
                24 px
              </SelectItem>

              <SelectItem value="28px">
                28 px
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* EDITABLE AREA */}
        <div
          ref={editorRef}
          contentEditable={!saving}
          suppressContentEditableWarning
          onInput={syncContent}
          onKeyDown={handleKeyDown}
          className="
            min-h-[220px]
            w-full
            rounded-b-md
            border
            bg-background
            p-4
            text-sm
            leading-7
            outline-none
            focus:ring-2
            focus:ring-primary/30
          "
          data-placeholder="Nhập nội dung nội quy..."
        />
      </div>

      {/* =========================
          ACTIONS
      ========================== */}
      <div className="flex justify-end gap-2">

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Hủy
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={
            saving ||
            !title.trim() ||
            !content.trim()
          }
        >
          {saving
            ? "Đang lưu..."
            : "Lưu nội quy"}
        </Button>

      </div>

    </div>
  );
}
import type { Editor, Range } from "@tiptap/react";
import {
  TextT,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  CodeBlock,
  Minus,
  ImageSquare,
  VideoCamera,
  SquaresFour,
  Columns,
} from "@phosphor-icons/react";

export interface SuggestionItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ReactNode;
  command: (props: { editor: Editor; range: Range }) => void;
}

let uploadCallbacks: {
  image: () => void;
  video: () => void;
  gallery: () => void;
} | null = null;

export function registerUploadCallbacks(callbacks: typeof uploadCallbacks) {
  uploadCallbacks = callbacks;
}

export const suggestionItems: SuggestionItem[] = [
  {
    title: "Текст",
    description: "Просто начните писать",
    searchTerms: ["text", "paragraph", "текст"],
    icon: <TextT className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    title: "Заголовок 1",
    description: "Большой заголовок раздела",
    searchTerms: ["h1", "heading", "заголовок"],
    icon: <TextHOne className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Заголовок 2",
    description: "Средний заголовок",
    searchTerms: ["h2", "heading", "заголовок"],
    icon: <TextHTwo className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Заголовок 3",
    description: "Маленький заголовок",
    searchTerms: ["h3", "heading", "заголовок"],
    icon: <TextHThree className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Маркированный список",
    description: "Список с точками",
    searchTerms: ["bullet", "list", "список"],
    icon: <ListBullets className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Нумерованный список",
    description: "Список с цифрами",
    searchTerms: ["ordered", "list", "список"],
    icon: <ListNumbers className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Код",
    description: "Блок с кодом",
    searchTerms: ["code", "pre", "код"],
    icon: <CodeBlock className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Разделитель",
    description: "Разделяет блоки",
    searchTerms: ["hr", "divider", "разделитель"],
    icon: <Minus className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Изображение",
    description: "Загрузить и обрезать",
    searchTerms: ["image", "photo", "изображение"],
    icon: <ImageSquare className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      uploadCallbacks?.image();
    },
  },
  {
    title: "Видео",
    description: "Загрузить mp4 или webm",
    searchTerms: ["video", "видео"],
    icon: <VideoCamera className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      uploadCallbacks?.video();
    },
  },
  {
    title: "Галерея",
    description: "Несколько изображений",
    searchTerms: ["gallery", "images", "галерея"],
    icon: <SquaresFour className="size-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      uploadCallbacks?.gallery();
    },
  },
  {
    title: "Колонки",
    description: "Две колонки текста",
    searchTerms: ["columns", "layout", "колонки"],
    icon: <Columns className="size-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([
          {
            type: "columns",
            attrs: { layout: "1-1" },
            content: [
              { type: "column", content: [{ type: "paragraph" }] },
              { type: "column", content: [{ type: "paragraph" }] },
            ],
          },
          { type: "paragraph" },
        ])
        .run();
    },
  },
];

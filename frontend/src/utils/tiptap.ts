import StarterKit from '@tiptap/starter-kit';
import { stripCodeTags } from './html';

export const richTextStarterKit = StarterKit.configure({
  codeBlock: false,
  code: false,
});

export const richTextEditorProps = {
  transformPastedHTML: (html: string) => stripCodeTags(html),
};

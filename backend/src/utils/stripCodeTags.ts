export const stripCodeTags = (html: string): string => {
  if (!html) return html;
  return html
    .replace(/<pre[^>]*>/gi, "")
    .replace(/<\/pre>/gi, "")
    .replace(/<code[^>]*>/gi, "")
    .replace(/<\/code>/gi, "");
};

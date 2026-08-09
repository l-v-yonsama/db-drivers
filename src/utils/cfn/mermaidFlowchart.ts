export const escapeMermaidLabel = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const mermaidTextCardLabel = (title: string, detail?: string): string =>
  escapeMermaidLabel(detail ? `${title}<br/>${detail}` : title).replace(
    /&lt;br\/&gt;/g,
    '<br/>',
  );

export const mermaidCompactLegendLabel = (
  title: string,
  entries: string[],
): string => mermaidTextCardLabel(title, entries.join(' · '));

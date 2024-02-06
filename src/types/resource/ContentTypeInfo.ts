export type ContentTypeInfo = {
  contentType: string;
  isTextValue: boolean;
  renderType: 'Image' | 'Text' | 'Video' | 'Audio' | 'Font' | 'Unknown';
  shortLang?: string;
  fileName: string;
};

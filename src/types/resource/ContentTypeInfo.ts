export type ContentTypeInfo = {
  contentType: string;
  isTextValue: boolean;
  renderType: 'Image' | 'Text' | 'Video' | 'Audio' | 'Unknown';
  shortLang?: string;
};

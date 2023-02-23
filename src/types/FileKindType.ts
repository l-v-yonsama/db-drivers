export enum FileKindType {
  All = 'All',
  Image = 'Image',
  Video = 'Video',
  Music = 'Music',
  Document = 'Document',
  Program = 'Program',
  Text = 'Text',
}

export namespace FileKindType {
  export function isValid(type: FileKindType, file_name: string): boolean {
    if (FileKindType.All === type) {
      return true;
    }
    file_name = file_name.toLocaleLowerCase().trim();
    const idx = file_name.lastIndexOf('.');
    if (file_name === '' || idx <= 0) {
      return false;
    }
    const ext = file_name.substring(idx + 1);
    switch (type) {
      case FileKindType.Image:
        return (
          ext === 'jpg' ||
          ext === 'jpeg' ||
          ext === 'png' ||
          ext === 'gif' ||
          ext === 'tiff' ||
          ext === 'tif' ||
          ext === 'bmp' ||
          ext === 'webp'
        );
      case FileKindType.Video:
        return (
          ext === 'mov' || ext === 'mp4' || ext === 'webm' || ext === 'avi'
        );
      case FileKindType.Music:
        return ext === 'wav' || ext === 'mp3';
      case FileKindType.Document:
        return (
          ext === 'xls' ||
          ext === 'doc' ||
          ext === 'ppt' ||
          ext === 'pdf' ||
          ext === 'xlsx' ||
          ext === 'docx' ||
          ext === 'pptx'
        );
      case FileKindType.Text:
        if (ext === 'txt' || ext === 'json') {
          return true;
        }
        return (
          ext === 'js' ||
          ext === 'ts' ||
          ext === 'py' ||
          ext === 'pyx' ||
          ext === 'java' ||
          ext === 'html' ||
          ext === 'xml' ||
          ext === 'vue' ||
          ext === 'c'
        );
      case FileKindType.Program:
        return (
          ext === 'js' ||
          ext === 'ts' ||
          ext === 'py' ||
          ext === 'pyx' ||
          ext === 'java' ||
          ext === 'html' ||
          ext === 'xml' ||
          ext === 'vue' ||
          ext === 'c'
        );
    }
    return false;
  }
}

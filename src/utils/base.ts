import { ContentTypeInfo } from '@l-v-yonsama/rdh';
import { format } from 'bytes';
import * as humanizeDuration from 'humanize-duration';
import { getExtension, getType } from 'mime-lite';
import { basename } from 'path';
import { parse } from 'url';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
});

export const parseContentType = (params: {
  fileName?: string;
  contentType?: string;
}): ContentTypeInfo => {
  const info: ContentTypeInfo = {
    contentType: params.contentType ?? '',
    isTextValue: false,
    renderType: 'Unknown',
    fileName: '',
  };

  if (params.fileName) {
    if (params.fileName.indexOf('://') >= 0) {
      try {
        const parsed = parse(params.fileName);
        info.fileName = basename(parsed.pathname);
      } catch (_) {
        console.error(_);
      }
    } else {
      info.fileName = basename(params.fileName);
    }
  }

  const fileName = (info.fileName ?? '').toLocaleLowerCase();
  let contentType = (params.contentType ?? '').toLocaleLowerCase();

  if (fileName.length === 0 && contentType.length === 0) {
    return info;
  }

  let extension: string | undefined = undefined;
  if (fileName && fileName.indexOf('.') >= 0) {
    extension = fileName.split('.').pop();
  }

  if (contentType.length === 0 && extension) {
    info.contentType = getType(extension);
    contentType = info.contentType.toLocaleLowerCase();
  }

  if (contentType.startsWith('text/')) {
    info.renderType = 'Text';
    info.isTextValue = true;
    if (contentType.startsWith('text/html')) {
      info.shortLang = 'html';
    } else if (contentType.startsWith('text/css')) {
      info.shortLang = 'css';
    } else if (contentType.startsWith('text/csv')) {
      info.shortLang = 'csv';
    } else if (contentType.startsWith('text/javascript')) {
      info.shortLang = 'js';
    } else if (contentType.startsWith('text/vbscript')) {
      info.shortLang = 'vb';
    } else if (contentType.startsWith('text/xml')) {
      info.shortLang = 'xml';
    } else {
      info.shortLang = 'text';
    }
  } else if (contentType.startsWith('image/')) {
    info.renderType = 'Image';
    if (contentType === 'image/svg+xml') {
      info.isTextValue = true;
      info.shortLang = 'xml';
    }
  } else if (contentType.startsWith('audio/')) {
    info.renderType = 'Audio';
    info.isTextValue = false;
  } else if (
    contentType.startsWith('font/') ||
    contentType.startsWith('application/font-') ||
    contentType.startsWith('application/x-font-') ||
    contentType.startsWith('application/vnd.ms-fontobject')
  ) {
    info.renderType = 'Font';
    info.isTextValue = false;
  } else if (contentType.startsWith('video/')) {
    info.renderType = 'Video';
    info.isTextValue = false;
  } else {
    if (contentType.startsWith('application/json')) {
      info.renderType = 'Text';
      info.isTextValue = true;
      info.shortLang = 'json';
    } else if (
      contentType.startsWith('application/javascript') ||
      contentType.startsWith('application/x-javascript')
    ) {
      info.renderType = 'Text';
      info.isTextValue = true;
      info.shortLang = 'js';
    } else if (contentType.startsWith('application/octet')) {
      if (extension === 'ico') {
        info.renderType = 'Image';
        if (contentType === 'image/ico') {
          info.isTextValue = false;
        }
      }
    }
  }

  if (info.isTextValue && info.shortLang === 'text' && extension) {
    if (
      extension.match(
        /(bat|c|cmake|cobol|coffee|cpp|csharp|cs|css|d|diff|docker|fsharp|go|gql|html|http|ini|properties|java|js|json|json5|jsx|less|lua|make|makefile|md|matlab|mermaid|nginx|perl|php|plsql|postcss|ps|ps1|prisma|pug|py|r|rb|rs|sas|sass|scala|scheme|scss|bash|sh|zsh|spl|sql|ssh-config|svelte|tex|tsx|ts|vb|vue|wasm|xml|yaml|yml)/,
      )
    ) {
      info.shortLang = extension;
    }
  }

  if (info.fileName === '') {
    info.fileName = `filename.${getExtension(info.contentType)}`;
  }

  return info;
};

export const prettyFileSize = (size: number): string => {
  return format(size, {
    decimalPlaces: 0,
    unitSeparator: ' ',
  });
};

export const prettyTime = (time: number): string => {
  return shortEnglishHumanizer(Math.round(time), {
    units: ['d', 'h', 'm', 's', 'ms'],
  });
};

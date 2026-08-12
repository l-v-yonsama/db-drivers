// Public surface (internal to this package - not re-exported from utils/index.ts) of the
// generic draw.io XML building blocks shared by cfn/ and er/. Curated the same way as
// ../cfn/index.ts and ../er/index.ts.
export {
  drawioLineLegendCells,
  drawioPage,
  pageLink,
  wrapDrawioPages,
  xmlEscape,
} from './drawioXml';
export type { DrawioLineLegendItem } from './drawioXml';

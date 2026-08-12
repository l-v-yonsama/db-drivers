// CloudFormation-specific draw.io page builder. Generic draw.io XML building blocks
// (xmlEscape, drawioPage, wrapDrawioPages, pageLink, drawioLineLegendCells) moved to
// ../drawio/drawioXml.ts once the ER draw.io generators turned out to need the exact same code.
import { drawioPage, xmlEscape } from '../drawio';

const drawioTemplateText = (source: string): string =>
  `&lt;div style=&quot;white-space:pre-wrap;&quot;&gt;${xmlEscape(source).replace(/\r\n|\r|\n/g, '&#xa;')}&lt;/div&gt;`;

export const drawioTemplatePage = (pageId: string, stackName: string, source: string): string => drawioPage(
  pageId,
  `Template: ${stackName}`,
  [
    `<mxCell id="${pageId}_title" value="${xmlEscape(`CloudFormation template: ${stackName}`)}" style="text;html=1;fontStyle=1;fontSize=18;" vertex="1" parent="${pageId}_1"><mxGeometry x="30" y="20" width="1500" height="40" as="geometry"/></mxCell>`,
    `<mxCell id="${pageId}_source" value="${drawioTemplateText(source)}" style="text;html=1;whiteSpace=wrap;overflow=hidden;align=left;verticalAlign=top;fontFamily=Courier New;fontSize=12;spacing=10;" vertex="1" parent="${pageId}_1"><mxGeometry x="30" y="80" width="1500" height="850" as="geometry"/></mxCell>`,
  ],
  `${pageId}_0`,
  `${pageId}_1`,
);

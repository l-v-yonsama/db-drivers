const xmlEscape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const drawioTemplateText = (source: string): string =>
  `&lt;div style=&quot;white-space:pre-wrap;&quot;&gt;${xmlEscape(source).replace(/\r\n|\r|\n/g, '&#xa;')}&lt;/div&gt;`;

export const drawioPage = (id: string, name: string, cells: string[], rootId = '0', layerId = '1'): string => [
  `<diagram id="${xmlEscape(id)}" name="${xmlEscape(name)}">`,
  '<mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0">',
  `<root><mxCell id="${rootId}"/><mxCell id="${layerId}" parent="${rootId}"/>${cells.join('')}</root>`,
  '</mxGraphModel>',
  '</diagram>',
].join('');

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

export const wrapDrawioPages = (pages: string[]): string => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<mxfile host="app.diagrams.net" modified="2026-08-07T00:00:00.000Z" agent="db-drivers" version="24.7.17">',
  ...pages,
  '</mxfile>',
].join('');

export const pageLink = (pageId: string): string => ` link="#${xmlEscape(pageId)}"`;

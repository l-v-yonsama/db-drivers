#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  CloudFormationClient,
  GetTemplateCommand,
} = require('@aws-sdk/client-cloudformation');

const {
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioArchitectureDiagram,
  generateDrawioCfnDependencyGraph,
  parseCfnYamlTemplate,
} = require('../built/src');

const stackNames = process.argv.slice(2);
const stacks = stackNames.length > 0
  ? stackNames
  : [
      'cfn-diagram-validation-vpc',
      'cfn-diagram-validation-api',
      'cfn-diagram-validation-events',
    ];

const endpoint = process.env.CFN_ENDPOINT || 'http://localhost:6005';
const region = process.env.AWS_DEFAULT_REGION || 'ap-northeast-1';
const outputFile = process.env.OUTPUT_FILE || path.resolve(
  __dirname,
  '../misc/localstack-cfn-validation-diagram.md',
);
const drawioOutputFile = process.env.DRAWIO_OUTPUT_FILE || path.resolve(
  __dirname,
  '../misc/localstack-cfn-validation-diagram.drawio',
);
const architectureDrawioOutputFile = process.env.ARCHITECTURE_DRAWIO_OUTPUT_FILE || path.resolve(
  __dirname,
  '../misc/localstack-cfn-architecture-diagram.drawio',
);
const dependencyDrawioOutputFile = process.env.DEPENDENCY_DRAWIO_OUTPUT_FILE || path.resolve(
  __dirname,
  '../misc/localstack-cfn-dependency-graph.drawio',
);

const client = new CloudFormationClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

const getTemplates = async () => Promise.all(
  stacks.map(async (stackName) => {
    const response = await client.send(new GetTemplateCommand({
      StackName: stackName,
      TemplateStage: 'Original',
    }));
    if (!response.TemplateBody) {
      throw new Error(`TemplateBody is empty: ${stackName}`);
    }
    const template = parseCfnYamlTemplate(response.TemplateBody);
    return {
      fileName: stackName,
      templateJSONString: JSON.stringify(template),
    };
  }),
);

const main = async () => {
  const list = await getTemplates();
  const application = generateDiagram({ list, mode: 'ApplicationDiagram' });
  const architecture = generateDiagram({ list, mode: 'ArchitectureDiagram' });
  const dependency = generateDiagram({
    list,
    mode: 'CfnDependencyGraph',
    viewpoint: 'CloudFormationView',
  });

  const markdown = [
    '# LocalStack CloudFormation validation diagrams',
    '',
    `- Endpoint: \`${endpoint}\``,
    `- Stacks: ${stacks.map((stack) => `\`${stack}\``).join(', ')}`,
    '',
    '## ApplicationDiagram',
    '',
    application,
    '',
    '## ArchitectureDiagram',
    '',
    architecture,
    '',
    '## CfnDependencyGraph',
    '',
    dependency,
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, markdown, 'utf8');
  console.log(`Generated: ${outputFile}`);

  fs.mkdirSync(path.dirname(drawioOutputFile), { recursive: true });
  fs.writeFileSync(drawioOutputFile, generateDrawioApplicationDiagram({
    list,
    mode: 'ApplicationDiagram',
  }), 'utf8');
  console.log(`Generated: ${drawioOutputFile}`);

  fs.writeFileSync(architectureDrawioOutputFile, generateDrawioArchitectureDiagram({
    list,
    mode: 'ArchitectureDiagram',
  }), 'utf8');
  console.log(`Generated: ${architectureDrawioOutputFile}`);

  fs.writeFileSync(dependencyDrawioOutputFile, generateDrawioCfnDependencyGraph({
    list,
    mode: 'CfnDependencyGraph',
    viewpoint: 'CloudFormationView',
  }), 'utf8');
  console.log(`Generated: ${dependencyDrawioOutputFile}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

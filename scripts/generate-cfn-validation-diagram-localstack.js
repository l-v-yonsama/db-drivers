#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  CloudFormationClient,
  DescribeStacksCommand,
  GetTemplateCommand,
} = require('@aws-sdk/client-cloudformation');

const {
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioArchitectureDiagram,
  generateDrawioCfnDependencyGraph,
  parseCfnYamlTemplate,
} = require('../built/src');

// This is a repository-local validation script, not a configurable CLI. Keep its inputs fixed so
// every run produces one diagram set for the five LocalStack stacks and a separate diagram set
// for the offline-only standard web template.
const stacks = [
  'cfn-diagram-validation-vpc',
  'cfn-diagram-validation-api',
  'cfn-diagram-validation-events',
  'cfn-diagram-validation-shared-data',
  'cfn-diagram-validation-shared-data-consumer',
];
const standardWebTemplate = {
  fileName: 'standard-web-application.yaml',
  stackName: 'cfn-diagram-validation-standard-web-application',
  templatePath: path.resolve(
    __dirname,
    '../__tests__/data/cfn/validation/standard-web-application.yaml',
  ),
};

const endpoint = 'http://localhost:6005';
const region = 'ap-northeast-1';
const localStackOutputDirectory = path.resolve(
  __dirname,
  '../misc/localstack-cfn-validation',
);
const standardWebOutputDirectory = path.resolve(
  __dirname,
  '../misc/standard-web-application-cfn-validation',
);

const client = new CloudFormationClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const getLocalStackTemplates = async () => Promise.all(
  stacks.map(async (stackName) => {
    const [response, description] = await Promise.all([
      client.send(new GetTemplateCommand({
        StackName: stackName,
        TemplateStage: 'Original',
      })),
      client.send(new DescribeStacksCommand({ StackName: stackName })),
    ]);
    if (!response.TemplateBody) {
      throw new Error(`TemplateBody is empty: ${stackName}`);
    }
    const template = parseCfnYamlTemplate(response.TemplateBody);
    const deployedStack = description.Stacks?.[0];
    const accountId = deployedStack?.StackId?.split(':')[4];
    return {
      fileName: stackName,
      templateSource: response.TemplateBody,
      templateJSONString: JSON.stringify(template),
      parameterValues: Object.fromEntries(
        (deployedStack?.Parameters ?? []).flatMap((parameter) =>
          parameter.ParameterKey && parameter.ParameterValue !== undefined
            ? [[parameter.ParameterKey, parameter.ParameterValue]]
            : []),
      ),
      pseudoParameterValues: {
        'AWS::StackName': deployedStack?.StackName || stackName,
        'AWS::Region': region,
        'AWS::Partition': 'aws',
        ...(accountId ? { 'AWS::AccountId': accountId } : {}),
      },
    };
  }),
);

const getStandardWebTemplate = () => {
  const templateSource = fs.readFileSync(standardWebTemplate.templatePath, 'utf8');
  return {
    fileName: standardWebTemplate.fileName,
    templateSource,
    templateJSONString: JSON.stringify(parseCfnYamlTemplate(templateSource)),
    pseudoParameterValues: {
      'AWS::StackName': standardWebTemplate.stackName,
      'AWS::Region': region,
      'AWS::Partition': 'aws',
      'AWS::AccountId': '000000000000',
    },
  };
};

const generateArtifactSet = ({
  list,
  title,
  metadata,
  outputDirectory,
}) => {
  const application = generateDiagram({ list, mode: 'ApplicationDiagram' });
  const architecture = generateDiagram({ list, mode: 'ArchitectureDiagram' });
  const dependency = generateDiagram({
    list,
    mode: 'CfnDependencyGraph',
    viewpoint: 'CloudFormationView',
  });

  const markdown = [
    `# ${title}`,
    '',
    ...metadata,
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

  const outputFile = path.resolve(outputDirectory, 'diagrams.md');
  const drawioOutputFile = path.resolve(outputDirectory, 'application.drawio');
  const architectureDrawioOutputFile = path.resolve(outputDirectory, 'architecture.drawio');
  const dependencyDrawioOutputFile = path.resolve(outputDirectory, 'dependency-graph.drawio');
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(outputFile, markdown, 'utf8');
  console.log(`Generated: ${outputFile}`);

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

const main = async () => {
  const localStackList = await getLocalStackTemplates();
  generateArtifactSet({
    list: localStackList,
    title: 'LocalStack CloudFormation validation diagrams',
    metadata: [
      `- Endpoint: \`${endpoint}\``,
      `- Stacks: ${stacks.map((stack) => `\`${stack}\``).join(', ')}`,
    ],
    outputDirectory: localStackOutputDirectory,
  });

  generateArtifactSet({
    list: [getStandardWebTemplate()],
    title: 'Standard web application CloudFormation validation diagrams',
    metadata: [
      `- Local template: \`${standardWebTemplate.fileName}\``,
      '- Deployment: not deployed to LocalStack',
    ],
    outputDirectory: standardWebOutputDirectory,
  });
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

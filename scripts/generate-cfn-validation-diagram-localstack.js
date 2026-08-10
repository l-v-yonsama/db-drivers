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
  generateDrawioCfnDependencyGraph,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  parseCfnYamlTemplate,
} = require('../built/src');

// This is a repository-local validation script, not a configurable CLI. Keep its inputs fixed so
// every run produces one diagram set for the five LocalStack stacks and separate diagram sets
// for the offline-only standard web and WAF-to-ALB templates.
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
const wafAlbTemplate = {
  fileName: 'waf-alb-application.yaml',
  stackName: 'cfn-diagram-validation-waf-alb-application',
  templatePath: path.resolve(
    __dirname,
    '../__tests__/data/cfn/validation/waf-alb-application.yaml',
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
const wafAlbOutputDirectory = path.resolve(
  __dirname,
  '../misc/waf-alb-application-cfn-validation',
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

const getOfflineTemplate = (templateDefinition) => {
  const templateSource = fs.readFileSync(templateDefinition.templatePath, 'utf8');
  return {
    fileName: templateDefinition.fileName,
    templateSource,
    templateJSONString: JSON.stringify(parseCfnYamlTemplate(templateSource)),
    pseudoParameterValues: {
      'AWS::StackName': templateDefinition.stackName,
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
  const multiAzDeploymentTrafficPathsAndProtection = generateDiagram({
    list,
    mode: 'MultiAzDeploymentTrafficPathsAndProtection',
  });
  const dependency = generateDiagram({
    list,
    mode: 'CfnDependencyGraph',
    viewpoint: 'CloudFormationView',
  });

  const markdownOutputs = [
    {
      fileName: 'application.md',
      viewTitle: 'ApplicationDiagram',
      diagram: application,
    },
    {
      fileName: 'multi-az-deployment-traffic-paths-and-protection.md',
      viewTitle: 'Multi-AZ Deployment, Traffic Paths & Protection',
      diagram: multiAzDeploymentTrafficPathsAndProtection,
    },
    {
      fileName: 'dependency-graph.md',
      viewTitle: 'CfnDependencyGraph',
      diagram: dependency,
    },
  ];

  const drawioOutputFile = path.resolve(outputDirectory, 'application.drawio');
  const multiAzDrawioOutputFile = path.resolve(
    outputDirectory,
    'multi-az-deployment-traffic-paths-and-protection.drawio',
  );
  const dependencyDrawioOutputFile = path.resolve(outputDirectory, 'dependency-graph.drawio');
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const { fileName, viewTitle, diagram } of markdownOutputs) {
    const outputFile = path.resolve(outputDirectory, fileName);
    const markdown = [
      `# ${title}: ${viewTitle}`,
      '',
      ...metadata,
      '',
      diagram,
      '',
    ].join('\n');
    fs.writeFileSync(outputFile, markdown, 'utf8');
    console.log(`Generated: ${outputFile}`);
  }

  const obsoleteOutputFiles = [
    'diagrams.md',
    'multi-az-deployment-data-paths.md',
    'multi-az-deployment-data-paths.drawio',
  ];
  obsoleteOutputFiles.forEach((fileName) => {
    const obsoleteOutputFile = path.resolve(outputDirectory, fileName);
    if (fs.existsSync(obsoleteOutputFile)) {
      fs.unlinkSync(obsoleteOutputFile);
      console.log(`Removed obsolete output: ${obsoleteOutputFile}`);
    }
  });

  fs.writeFileSync(drawioOutputFile, generateDrawioApplicationDiagram({
    list,
    mode: 'ApplicationDiagram',
  }), 'utf8');
  console.log(`Generated: ${drawioOutputFile}`);

  fs.writeFileSync(multiAzDrawioOutputFile, generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
    list,
    mode: 'MultiAzDeploymentTrafficPathsAndProtection',
  }), 'utf8');
  console.log(`Generated: ${multiAzDrawioOutputFile}`);

  fs.writeFileSync(dependencyDrawioOutputFile, generateDrawioCfnDependencyGraph({
    list,
    mode: 'CfnDependencyGraph',
    viewpoint: 'CloudFormationView',
  }), 'utf8');
  console.log(`Generated: ${dependencyDrawioOutputFile}`);
};

const main = async () => {
  // The offline references remain reproducible even when LocalStack is not running.
  generateArtifactSet({
    list: [getOfflineTemplate(standardWebTemplate)],
    title: 'Standard web application CloudFormation validation diagrams',
    metadata: [
      `- Local template: \`${standardWebTemplate.fileName}\``,
      '- Deployment: not deployed to LocalStack',
    ],
    outputDirectory: standardWebOutputDirectory,
  });
  generateArtifactSet({
    list: [getOfflineTemplate(wafAlbTemplate)],
    title: 'WAF to ALB CloudFormation validation diagrams',
    metadata: [
      `- Local template: \`${wafAlbTemplate.fileName}\``,
      '- Deployment: not deployed to LocalStack',
    ],
    outputDirectory: wafAlbOutputDirectory,
  });

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
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

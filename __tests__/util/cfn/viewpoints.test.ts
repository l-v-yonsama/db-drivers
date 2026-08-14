import { GenerateDiagramParams, generateDiagram } from '../../../src';
import testApiLambdaStackTemplate from '../../data/cfn/templates/db-drivers-test-api-lambda-stack.json';

describe('cfn', () => {
  describe('viewpoint / auxiliaryTreatment', () => {
    const apiLambdaDiagramParams = (
      overrides: Partial<GenerateDiagramParams> = {},
    ): GenerateDiagramParams => ({
      mode: 'CfnDependencyGraph' as const,
      list: [
        {
          fileName: 'db-drivers-test-api-lambda-stack.json',
          templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
        },
      ],
      ...overrides,
    });

    it('omitting viewpoint/auxiliaryTreatment behaves exactly like explicit ApplicationView + MergeIntoLabel', () => {
      const omitted = generateDiagram(apiLambdaDiagramParams());
      const explicit = generateDiagram(
        apiLambdaDiagramParams({
          viewpoint: 'ApplicationView',
          auxiliaryTreatment: 'MergeIntoLabel',
        }),
      );

      expect(omitted).toBe(explicit);
    });

    it("MergeIntoLabel (default): folds each auxiliary resource onto its focus neighbor's label instead of giving it a node/edge of its own", () => {
      const diagram = generateDiagram(apiLambdaDiagramParams());

      // The three ApiGateway/Lambda focus resources are still full nodes.
      expect(diagram).toContain(
        'f0_GreetingFunction["GreetingFunction<br/>Function',
      );
      expect(diagram).toContain('f0_GreetingApi["GreetingApi<br/>RestApi');
      expect(diagram).toContain('f0_GreetingMethod["GreetingMethod<br/>Method');
      // None of the three auxiliary resources get a node of their own.
      expect(diagram).not.toContain('f0_GreetingFunctionRole[');
      expect(diagram).not.toContain('f0_GreetingApiDeployment[');
      expect(diagram).not.toContain('f0_GreetingApiInvokePermission[');
      expect(diagram).not.toContain('Supporting');
      // Each auxiliary resource's id survives as a merged annotation on the focus resource(s)
      // it had an edge with, instead - GreetingFunction has one from GreetingFunction->Role
      // and one from Permission->GreetingFunction, so it picks up both.
      expect(diagram).toContain('with GreetingFunctionRole');
      expect(diagram).toContain('GreetingApiInvokePermission');
      const functionLine = diagram
        .split('\n')
        .find((line) => line.includes('f0_GreetingFunction['));
      expect(functionLine).toContain('with GreetingFunctionRole');
      expect(functionLine).toContain('GreetingApiInvokePermission');
      // GreetingApiDeployment depended on both GreetingMethod and GreetingApi - both focus
      // neighbors pick up its id.
      expect(diagram).toMatch(
        /GreetingApi<br\/>RestApi · with GreetingApiDeployment, GreetingApiInvokePermission/,
      );
      expect(diagram).toMatch(
        /GreetingMethod<br\/>Method · with GreetingApiDeployment/,
      );
      // No arrow touches an auxiliary resource - the four focus-to-focus edges survive,
      // including the Fn::Sub SourceArn reference from the invoke permission to the API.
      // (GreetingFunctionRole/Deployment/InvokePermission's ids only ever appear as merged
      // "with_..." label text above, never as their own "f0_<id>(" node or in a "-->" line).
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
      expect(diagram).toContain(
        'f0_GreetingResource -.->|"GetAtt"| f0_GreetingApi',
      );
      expect(diagram).toContain('f0_GreetingMethod -->|"Ref"| f0_GreetingApi');
      expect(diagram).toContain(
        'f0_GreetingMethod -->|"Ref"| f0_GreetingResource',
      );
    });

    it("SeparateGroup: keeps every auxiliary resource as its own node in a 'Supporting' group, with no edges touching it", () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'SeparateGroup' }),
      );

      expect(diagram).toContain('    subgraph f0_supporting["Supporting"]');
      // Auxiliary resources render with their normal icon/label, just relocated - no merged
      // annotation text, since nothing needed folding onto anyone.
      expect(diagram).toContain(
        'f0_GreetingFunctionRole["GreetingFunctionRole<br/>Role"]:::supportingNode',
      );
      expect(diagram).toContain(
        'f0_GreetingApiDeployment["GreetingApiDeployment<br/>Deployment"]:::supportingNode',
      );
      expect(diagram).toContain(
        'f0_GreetingApiInvokePermission["GreetingApiInvokePermission<br/>Permission"]:::supportingNode',
      );
      // Only the four focus-to-focus edges remain - none of the auxiliary resources above
      // get an edge, per the explicit "no arrows for auxiliary elements" requirement.
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
      expect(diagram).not.toContain(' · with ');
    });

    it('Omit: auxiliary resources and every edge touching them disappear entirely', () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'Omit' }),
      );

      expect(diagram).not.toContain('GreetingFunctionRole');
      expect(diagram).not.toContain('GreetingApiDeployment');
      expect(diagram).not.toContain('GreetingApiInvokePermission');
      expect(diagram).not.toContain('Supporting');
      expect(diagram).not.toContain(' · with ');
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
    });

    it("CloudFormationView shows every resource as focus regardless of auxiliaryTreatment - matches today's unfiltered output", () => {
      const unfiltered = generateDiagram(
        apiLambdaDiagramParams({ viewpoint: 'CloudFormationView' }),
      );

      for (const logicalId of [
        'GreetingFunctionRole',
        'GreetingFunction',
        'GreetingApi',
        'GreetingResource',
        'GreetingMethod',
        'GreetingApiDeployment',
        'GreetingApiInvokePermission',
      ]) {
        expect(unfiltered).toContain(`f0_${logicalId}[`);
      }
      expect(unfiltered).not.toContain(' · with ');
      expect(unfiltered).not.toContain('Supporting');
      expect(unfiltered.match(/(?:-->|-.->|==>)/g)).toHaveLength(9);

      // auxiliaryTreatment is meaningless once nothing is auxiliary - same output no matter
      // which one is passed alongside CloudFormationView.
      for (const auxiliaryTreatment of [
        'MergeIntoLabel',
        'SeparateGroup',
        'Omit',
      ] as const) {
        expect(
          generateDiagram(
            apiLambdaDiagramParams({
              viewpoint: 'CloudFormationView',
              auxiliaryTreatment,
            }),
          ),
        ).toBe(unfiltered);
      }
    });

    it('classification genuinely depends on the viewpoint, not just "IAM-ish things are always auxiliary"', () => {
      // Infrastructure View's list explicitly includes IAM Role - and does *not* include
      // Lambda - so the focus/auxiliary split flips relative to ApplicationView for this
      // same fixture.
      const infrastructureView = generateDiagram(
        apiLambdaDiagramParams({ viewpoint: 'InfrastructureView' }),
      );

      // GreetingFunctionRole is now focus (Infrastructure View's own node, not merged text) -
      // and, since GreetingFunction is now the auxiliary side of that same edge, its id shows
      // up as a merged annotation on the Role instead of the other way around, the mirror
      // image of the ApplicationView test above.
      expect(infrastructureView).toContain(
        'f0_GreetingFunctionRole["GreetingFunctionRole<br/>Role',
      );
      expect(infrastructureView).not.toContain('f0_GreetingFunction[');
      const roleLine = infrastructureView
        .split('\n')
        .find((line) => line.includes('f0_GreetingFunctionRole['));
      expect(roleLine).toContain('with GreetingFunction');
    });
  });
});

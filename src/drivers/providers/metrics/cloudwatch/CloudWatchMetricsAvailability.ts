import {
  CloudWatchClient,
  ListMetricsCommand,
} from '@aws-sdk/client-cloudwatch';
import { MetricDimension } from '../../../../types';

type CloudWatchSender = Pick<CloudWatchClient, 'send'>;

export type DiscoverCloudWatchDimensionValuesInput = {
  namespace: string;
  metricName: string;
  matchingDimensions: MetricDimension[];
  dimensionName: string;
  signal?: AbortSignal;
};

export type DiscoverCloudWatchMetricNamesInput = {
  namespace: string;
  matchingDimensions?: MetricDimension[];
  exactDimensions?: boolean;
  signal?: AbortSignal;
};

/** Discovers recently known metric identities. */
export class CloudWatchMetricsAvailability {
  constructor(private readonly client: CloudWatchSender) {}

  async discoverMetricNames(
    input: DiscoverCloudWatchMetricNamesInput,
  ): Promise<string[]> {
    const names = new Set<string>();
    const matchingDimensions = input.matchingDimensions ?? [];
    let nextToken: string | undefined;
    do {
      const response = await this.client.send(
        new ListMetricsCommand({
          Namespace: input.namespace,
          Dimensions:
            matchingDimensions.length > 0 ? matchingDimensions : undefined,
          NextToken: nextToken,
        }),
        { abortSignal: input.signal },
      );
      nextToken = response.NextToken;
      for (const metric of response.Metrics ?? []) {
        const dimensions = metric.Dimensions ?? [];
        const matches = matchingDimensions.every((expected) =>
          dimensions.some(
            (actual) =>
              actual.Name === expected.Name && actual.Value === expected.Value,
          ),
        );
        if (!matches) continue;
        if (
          input.exactDimensions &&
          dimensions.length !== matchingDimensions.length
        ) {
          continue;
        }
        if (metric.MetricName) names.add(metric.MetricName);
      }
    } while (nextToken);
    return [...names].sort();
  }

  async discoverDimensionValues(
    input: DiscoverCloudWatchDimensionValuesInput,
  ): Promise<string[]> {
    const values = new Set<string>();
    let nextToken: string | undefined;
    do {
      const response = await this.client.send(
        new ListMetricsCommand({
          Namespace: input.namespace,
          MetricName: input.metricName,
          Dimensions: input.matchingDimensions,
          NextToken: nextToken,
        }),
        { abortSignal: input.signal },
      );
      nextToken = response.NextToken;
      for (const metric of response.Metrics ?? []) {
        const matches = input.matchingDimensions.every((expected) =>
          metric.Dimensions?.some(
            (actual) =>
              actual.Name === expected.Name && actual.Value === expected.Value,
          ),
        );
        if (!matches) continue;
        const value = metric.Dimensions?.find(
          (dimension) => dimension.Name === input.dimensionName,
        )?.Value;
        if (value) values.add(value);
      }
    } while (nextToken);
    return [...values].sort();
  }
}

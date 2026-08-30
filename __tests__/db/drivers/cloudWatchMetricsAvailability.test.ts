import {
  CloudWatchMetricsAvailability,
  type DiscoverCloudWatchDimensionValuesInput,
} from '../../../src';

describe('CloudWatchMetricsAvailability', () => {
  it('discovers only exact-dimension metric names across pages', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        NextToken: 'next',
        Metrics: [
          { MetricName: 'Send', Dimensions: [] },
          {
            MetricName: 'Open',
            Dimensions: [{ Name: 'campaign', Value: 'summer' }],
          },
        ],
      })
      .mockResolvedValueOnce({
        Metrics: [
          { MetricName: 'Click', Dimensions: [] },
          { MetricName: 'Send', Dimensions: [] },
        ],
      });
    const availability = new CloudWatchMetricsAvailability({ send } as never);

    await expect(
      availability.discoverMetricNames({
        namespace: 'AWS/SES',
        matchingDimensions: [],
        exactDimensions: true,
      }),
    ).resolves.toEqual(['Click', 'Send']);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('paginates, verifies matching dimensions, and returns sorted unique values', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        NextToken: 'next',
        Metrics: [
          {
            Dimensions: [
              { Name: 'BucketName', Value: 'orders' },
              { Name: 'StorageType', Value: 'StandardStorage' },
            ],
          },
          {
            Dimensions: [
              { Name: 'BucketName', Value: 'other' },
              { Name: 'StorageType', Value: 'GlacierStorage' },
            ],
          },
        ],
      })
      .mockResolvedValueOnce({
        Metrics: [
          {
            Dimensions: [
              { Name: 'BucketName', Value: 'orders' },
              { Name: 'StorageType', Value: 'GlacierStorage' },
            ],
          },
          {
            Dimensions: [
              { Name: 'BucketName', Value: 'orders' },
              { Name: 'StorageType', Value: 'StandardStorage' },
            ],
          },
        ],
      });
    const availability = new CloudWatchMetricsAvailability({ send } as never);
    const input: DiscoverCloudWatchDimensionValuesInput = {
      namespace: 'AWS/S3',
      metricName: 'BucketSizeBytes',
      matchingDimensions: [{ Name: 'BucketName', Value: 'orders' }],
      dimensionName: 'StorageType',
    };

    await expect(availability.discoverDimensionValues(input)).resolves.toEqual([
      'GlacierStorage',
      'StandardStorage',
    ]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('returns an empty list without treating it as feature configuration state', async () => {
    const send = jest.fn().mockResolvedValue({ Metrics: [] });
    const availability = new CloudWatchMetricsAvailability({ send } as never);

    await expect(
      availability.discoverDimensionValues({
        namespace: 'AWS/S3',
        metricName: 'AllRequests',
        matchingDimensions: [{ Name: 'BucketName', Value: 'orders' }],
        dimensionName: 'FilterId',
      }),
    ).resolves.toEqual([]);
  });
});

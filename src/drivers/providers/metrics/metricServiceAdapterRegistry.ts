import { MetricServiceAdapter } from '../../../types';

export class MetricServiceAdapterRegistry {
  private readonly adapters = new Map<string, MetricServiceAdapter>();

  constructor(adapters: readonly MetricServiceAdapter[] = []) {
    adapters.forEach((adapter) => this.register(adapter));
  }

  register(adapter: MetricServiceAdapter): void {
    if (this.adapters.has(adapter.providerId)) {
      throw new Error(
        `Duplicate metric service providerId: ${adapter.providerId}`,
      );
    }
    this.adapters.set(adapter.providerId, adapter);
  }

  resolve(providerId: string): MetricServiceAdapter | undefined {
    return this.adapters.get(providerId);
  }

  require(providerId: string): MetricServiceAdapter {
    const adapter = this.resolve(providerId);
    if (!adapter) {
      throw new Error(`Unsupported metric service providerId: ${providerId}`);
    }
    return adapter;
  }
}

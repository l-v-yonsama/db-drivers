// DbResource.ts was split by domain (readability-maintenance-plan-2026-08-14.md,
// Phase 6). This barrel re-exports everything exactly as the single
// DbResource.ts file used to, so existing `from '../resource'` /
// `from '../../resource'` imports keep working unchanged.
export * from './base';
export * from './types';
export * from './connection';
export * from './rdb';
export * from './iam';
export * from './aws';
export * from './keyValue';
export * from './fromJson';

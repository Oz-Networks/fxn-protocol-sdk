// src/config/index.ts
import { getConfig } from './manager';
import { NetworkConfig } from './types';

// backward compatibility export
export const config: NetworkConfig = getConfig().getNetworkConfig();

export * from './types';
export * from './networks';
export * from './validator';
export * from './manager';

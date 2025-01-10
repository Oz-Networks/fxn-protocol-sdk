// src/config/index.ts
import { getConfig, initializeConfig } from './manager';
import { NetworkConfig } from './types';

// Create config with fallback initialization
let config: NetworkConfig;
try {
    config = getConfig().getNetworkConfig();
} catch {
    // If not initialized, initialize with defaults
    config = initializeConfig({
        network: 'devnet',
        timeout: 30000,
        commitment: 'confirmed'
    }).getNetworkConfig();
}

// Export the config
export { config };

// Export everything else
export * from './types';
export * from './networks';
export * from './validator';
export * from './manager';

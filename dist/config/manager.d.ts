import { SDKConfig, NetworkConfig } from './types';
export declare class ConfigurationManager {
    private static instance;
    private currentConfig;
    private networkConfig;
    private constructor();
    static initialize(config: SDKConfig): ConfigurationManager;
    static getInstance(): ConfigurationManager;
    private validateAddresses;
    getConfig(): SDKConfig;
    getNetworkConfig(): NetworkConfig;
    updateConfig(config: Partial<SDKConfig>): void;
}
export declare const initializeConfig: (config: SDKConfig) => ConfigurationManager;
export declare const getConfig: () => ConfigurationManager;

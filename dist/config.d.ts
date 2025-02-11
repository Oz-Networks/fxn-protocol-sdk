export type NetworkType = 'mainnet' | 'testnet' | 'devnet';
export interface NetworkConfig {
    subscriptionManagerAddress: string;
    nftTokenAddress: string;
    fxnMintAddress: string;
    rpcEndpoint: string;
    wsEndpoint?: string;
}
export interface SDKConfig {
    network: NetworkType;
    timeout?: number;
    commitment?: 'processed' | 'confirmed' | 'finalized';
}
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

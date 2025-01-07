import { SDKConfig, NetworkConfig } from './types';
import { NETWORK_CONFIGS } from './networks';
import { AddressValidator } from './validator';

export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private currentConfig: SDKConfig;
    private networkConfig: NetworkConfig;

    private constructor(config: SDKConfig) {
        this.currentConfig = {
            ...config,
            timeout: config.timeout || 30000,
            commitment: config.commitment || 'confirmed'
        };
        this.networkConfig = NETWORK_CONFIGS[config.network];
        this.validateAddresses();
    }

    public static initialize(config: SDKConfig): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager(config);
        }
        return ConfigurationManager.instance;
    }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            throw new Error('ConfigurationManager must be initialized before use');
        }
        return ConfigurationManager.instance;
    }

    private validateAddresses(): void {
        AddressValidator.validate(this.networkConfig.subscriptionManagerAddress, 'subscription manager address');
        AddressValidator.validate(this.networkConfig.nftTokenAddress, 'NFT token address');
        AddressValidator.validate(this.networkConfig.fxnMintAddress, 'FXN mint address');
    }

    public getConfig(): SDKConfig {
        return { ...this.currentConfig };
    }

    public getNetworkConfig(): NetworkConfig {
        return { ...this.networkConfig };
    }

    public updateConfig(config: Partial<SDKConfig>): void {
        if (config.network && config.network !== this.currentConfig.network) {
            this.networkConfig = NETWORK_CONFIGS[config.network];
            this.validateAddresses();
        }
        this.currentConfig = {
            ...this.currentConfig,
            ...config
        };
    }
}

export const initializeConfig = (config: SDKConfig): ConfigurationManager => {
    return ConfigurationManager.initialize(config);
};

export const getConfig = (): ConfigurationManager => {
    return ConfigurationManager.getInstance();
};
import { PublicKey } from '@solana/web3.js';

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

class AddressValidator {
    static validate(address: string, label: string): void {
        try {
            new PublicKey(address);
        } catch (error) {
            throw new Error(`Invalid ${label}: ${address}`);
        }
    }
}

const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
    mainnet: {
        subscriptionManagerAddress: 'AnPhQYFcJEPBG2JTrvaNne85rXufC1Q97bu29YaWvKDs',
        nftTokenAddress: '3sH789kj7yAtmuJKJQqKnxdWd9Q28qfN1DzkeFZd7ty7',
        fxnMintAddress: '34dcPojKodMA2GkH2E9jjNi3gheweipGDaUAgoX73dK8',
        rpcEndpoint: 'https://api.mainnet-beta.solana.com',
        wsEndpoint: 'wss://api.mainnet-beta.solana.com'
    },
    testnet: {
        subscriptionManagerAddress: 'AnPhQYFcJEPBG2JTrvaNne85rXufC1Q97bu29YaWvKDs',
        nftTokenAddress: '3sH789kj7yAtmuJKJQqKnxdWd9Q28qfN1DzkeFZd7ty7',
        fxnMintAddress: '34dcPojKodMA2GkH2E9jjNi3gheweipGDaUAgoX73dK8',
        rpcEndpoint: 'https://api.testnet.solana.com',
        wsEndpoint: 'wss://api.testnet.solana.com'
    },
    devnet: {
        subscriptionManagerAddress: 'AnPhQYFcJEPBG2JTrvaNne85rXufC1Q97bu29YaWvKDs',
        nftTokenAddress: '3sH789kj7yAtmuJKJQqKnxdWd9Q28qfN1DzkeFZd7ty7',
        fxnMintAddress: '34dcPojKodMA2GkH2E9jjNi3gheweipGDaUAgoX73dK8',
        rpcEndpoint: 'https://api.devnet.solana.com',
        wsEndpoint: 'wss://api.devnet.solana.com'
    }
};

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

// Export singleton instance creator
export const initializeConfig = (config: SDKConfig): ConfigurationManager => {
    return ConfigurationManager.initialize(config);
};

// Export config getter
export const getConfig = (): ConfigurationManager => {
    return ConfigurationManager.getInstance();
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.initializeConfig = exports.ConfigurationManager = void 0;
const web3_js_1 = require("@solana/web3.js");
class AddressValidator {
    static validate(address, label) {
        try {
            new web3_js_1.PublicKey(address);
        }
        catch (error) {
            throw new Error(`Invalid ${label}: ${address}`);
        }
    }
}
const NETWORK_CONFIGS = {
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
class ConfigurationManager {
    constructor(config) {
        this.currentConfig = Object.assign(Object.assign({}, config), { timeout: config.timeout || 30000, commitment: config.commitment || 'confirmed' });
        this.networkConfig = NETWORK_CONFIGS[config.network];
        this.validateAddresses();
    }
    static initialize(config) {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager(config);
        }
        return ConfigurationManager.instance;
    }
    static getInstance() {
        if (!ConfigurationManager.instance) {
            throw new Error('ConfigurationManager must be initialized before use');
        }
        return ConfigurationManager.instance;
    }
    validateAddresses() {
        AddressValidator.validate(this.networkConfig.subscriptionManagerAddress, 'subscription manager address');
        AddressValidator.validate(this.networkConfig.nftTokenAddress, 'NFT token address');
        AddressValidator.validate(this.networkConfig.fxnMintAddress, 'FXN mint address');
    }
    getConfig() {
        return Object.assign({}, this.currentConfig);
    }
    getNetworkConfig() {
        return Object.assign({}, this.networkConfig);
    }
    updateConfig(config) {
        if (config.network && config.network !== this.currentConfig.network) {
            this.networkConfig = NETWORK_CONFIGS[config.network];
            this.validateAddresses();
        }
        this.currentConfig = Object.assign(Object.assign({}, this.currentConfig), config);
    }
}
exports.ConfigurationManager = ConfigurationManager;
// Export singleton instance creator
const initializeConfig = (config) => {
    return ConfigurationManager.initialize(config);
};
exports.initializeConfig = initializeConfig;
// Export config getter
const getConfig = () => {
    return ConfigurationManager.getInstance();
};
exports.getConfig = getConfig;

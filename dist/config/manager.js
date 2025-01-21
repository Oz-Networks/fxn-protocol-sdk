"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.initializeConfig = exports.ConfigurationManager = void 0;
const networks_1 = require("./networks");
const validator_1 = require("./validator");
class ConfigurationManager {
    constructor(config) {
        this.currentConfig = Object.assign(Object.assign({}, config), { timeout: config.timeout || 30000, commitment: config.commitment || 'confirmed' });
        this.networkConfig = networks_1.NETWORK_CONFIGS[config.network];
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
            // Fallback to devnet config for backward compatibility
            return ConfigurationManager.initialize({
                network: 'devnet',
                timeout: 30000,
                commitment: 'confirmed'
            });
        }
        return ConfigurationManager.instance;
    }
    validateAddresses() {
        validator_1.AddressValidator.validate(this.networkConfig.subscriptionManagerAddress, 'subscription manager address');
        validator_1.AddressValidator.validate(this.networkConfig.nftTokenAddress, 'NFT token address');
        validator_1.AddressValidator.validate(this.networkConfig.fxnMintAddress, 'FXN mint address');
    }
    getConfig() {
        return Object.assign({}, this.currentConfig);
    }
    getNetworkConfig() {
        return Object.assign({}, this.networkConfig);
    }
    updateConfig(config) {
        if (config.network && config.network !== this.currentConfig.network) {
            this.networkConfig = networks_1.NETWORK_CONFIGS[config.network];
            this.validateAddresses();
        }
        this.currentConfig = Object.assign(Object.assign({}, this.currentConfig), config);
    }
}
exports.ConfigurationManager = ConfigurationManager;
const initializeConfig = (config) => {
    return ConfigurationManager.initialize(config);
};
exports.initializeConfig = initializeConfig;
const getConfig = () => {
    return ConfigurationManager.getInstance();
};
exports.getConfig = getConfig;

import { NetworkType, NetworkConfig } from './types';

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
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
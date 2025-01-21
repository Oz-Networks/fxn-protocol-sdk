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

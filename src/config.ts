// config.ts
export const RPC_URL = "https://rpc.ozprotocol.com/ext/bc/v3bKtvrWywFjDNdP5LWsomJG6k9h5P7Ke8WQykoSzrL2CMuFb/rpc";

export const SUBSCRIPTION_ABI = [
    "function getSubscribers(address _dataProvider) view returns(address[] memory)",
    "function subscriptions(address, address) view returns (uint256 endTime, string recipient)"
];

export const NFT_CONTRACT_ABI = [
    "function mint(address to) external"
];

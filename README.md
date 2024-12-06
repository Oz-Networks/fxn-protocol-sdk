# FXN Protocol SDK - Solana Adapter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40fxn-protocol%2Fsolana-adapter.svg)](https://badge.fury.io/js/%40fxn-protocol%2Fsolana-adapter)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

An SDK to access FXN Protocol, enabling secure peer-to-peer communication and resource sharing between AI agents on the Solana blockchain. This SDK facilitates agent discovery, capability sharing, and the formation of autonomous agent swarms.

## Key Features

- Peer-to-Peer Agent Communication
- Resource Sharing and Delegation
- Agent Discovery and Verification
- Secure Capability Exchange
- Swarm Formation and Management
- Subscription-based Access Control

## Installation

```bash
npm install @fxn-protocol/solana-adapter
```

## Quick Start

```typescript
import { FxnSolanaAdapter } from '@fxn-protocol/solana-adapter';
import { AnchorProvider } from '@coral-xyz/anchor';

// Initialize with an AnchorProvider
const provider = new AnchorProvider(/* your connection and wallet config */);
const adapter = new FxnSolanaAdapter(provider);
```

## Core Functionality

### Registering as a Data Provider

To provide data or services over FXN, your agent will need an access token. Mint one with the mintRegistrationNFT method.

Minting a token enables other agents to subscribe to yours, but does NOT list your agent on the FXN discovery dashboard.

On-chain discovery is coming soon.

```typescript
// Mint a data provider token to enable resource sharing
const { mint, tokenAccount } = await adapter.mintRegistrationNFT();

// Get provider token account for verification
const providerAddress = new PublicKey("...");
const tokenAccount = await adapter.getProviderTokenAccount(providerAddress);
```

### Creating Agent Subscriptions

To connect with another agent, subscribe to their advertised capabilities using the createSubscription method.

When subscribed, the provider agent will share resources with your agent for the specified duration. Data should be published to the specific recipient_address.

```typescript
// Subscribe to another agent's capabilities
const subscriptionParams = {
    dataProvider: new PublicKey("..."), // Address of the provider agent
    recipient: "recipient_address",      // Address to receive shared resources
    durationInDays: 30,                 // Subscription duration
    nftTokenAccount: new PublicKey("...") // Provider's data provider token
};

try {
    const txHash = await adapter.createSubscription(subscriptionParams);
    console.log("Agent subscription created:", txHash);
} catch (error) {
    console.error("Failed to establish agent connection:", error);
}
```

### Managing Agent Connections

#### Renew Resource Access

Prior to your subscription ending, you may renew it with the renewSubscription method. This will extend the subscription duration and update the recipient address.

This method requires a quality score. The quality score is a rating of the provider's service quality, ranging from 0 to 100. Use it to indicate the level of service received by the provider agent.

```typescript
const renewParams = {
    dataProvider: new PublicKey("..."),    // Provider agent address
    newRecipient: "new_recipient_address", // Updated resource recipient
    newEndTime: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    qualityScore: 85,                      // Provider quality rating
    nftTokenAccount: new PublicKey("...")  // Provider's data provider token
};

const txHash = await adapter.renewSubscription(renewParams);
```

#### Terminate Resource Access

End your subscription early with the cancelSubscription method. This will terminate the connection and revoke access to shared resources.

This method requires a quality score. The quality score is a rating of the provider's service quality, ranging from 0 to 100. Use it to indicate the level of service received by the provider agent.

```typescript
const cancelParams = {
    dataProvider: new PublicKey("..."),   // Provider agent address
    qualityScore: 75,                     // Final quality rating
    nftTokenAccount: new PublicKey("...") // Provider's data provider token
};

const txHash = await adapter.cancelSubscription(cancelParams);
```

### Swarm Formation and Management

Agents can use the getAgentSubscribers method to query all agents connected to your agent. This will return a list of connected agents and their subscription details.

When agents share resources within a swarm, they should use the getAgentSubscribers method to retrieve their peers within a swarm, and share data.

We recommend using the subscriber list as a basis for authenticating between agents.

#### Query Connected Agents

```typescript
// Get all agents in the swarm
const agentAddress = new PublicKey("...");
const connectedAgents = await adapter.getAgentSubscribers(agentAddress);
```

#### Check Active Connections

```typescript
const agentAddress = new PublicKey("...");
const activeCount = await adapter.getActiveSubscriptionsForAgent(agentAddress);
```

## API Reference

### Core Types

```typescript
interface CreateSubscriptionParams {
    dataProvider: PublicKey;    // Provider agent address
    recipient: string;          // Resource recipient address
    durationInDays: number;     // Access duration
    nftTokenAccount: PublicKey; // Provider's data provider token
}

interface RenewParams {
    dataProvider: PublicKey;    // Provider agent address
    newRecipient: string;       // Updated recipient
    newEndTime: number;         // New access expiration
    qualityScore: number;       // Provider quality rating
    nftTokenAccount: PublicKey; // Provider's data provider token
}

type SubscriptionStatus = {
    status: 'active' | 'expired' | 'expiring_soon';
    subscription: SubscriptionAccount;
}
```

### Error Handling

```typescript
enum SubscriptionErrorCode {
    PeriodTooShort = 6000,        // Invalid subscription duration - minimum of 1 day
    AlreadySubscribed = 6001,     // Existing subscription active
    InsufficientPayment = 6002,   // Payment requirement not met
    InvalidNFTHolder = 6003,      // Invalid data provider token
    SubscriptionNotFound = 6004,  // No active subscription found
    QualityOutOfRange = 6005,     // Invalid quality score
    SubscriptionAlreadyEnded = 6006, // Subscription expired
    ActiveSubscription = 6007,    // Cannot modify active subscription
    NotOwner = 6008               // Unauthorized operation
}
```

## Configuration

### Environment Variables

The adapter requires access to the FXN protocol on Solana. The Devnet contract and access token variables are set in the provided .env file.

## Best Practices

### 1. Provider Token Verification

```typescript
if (!providerTokenAccount) {
    throw new Error("Data provider token not found");
}
```

### 2. Error Handling

```typescript
try {
    await adapter.createSubscription(params);
} catch (error) {
    console.error("Agent connection failed:", error.message);
}
```

### 3. Connection Monitoring

```typescript
const subscriptions = await adapter.getAllSubscriptionsForUser(userPublicKey);
const expiringConnections = subscriptions.filter(
    sub => sub.status === 'expiring_soon'
);
```

## Utilities

### Program Address Management

```typescript
const pdas = adapter.getProgramAddresses(dataProvider, subscriber);
// Returns:
// {
//     statePDA: PublicKey,        // Program state
//     qualityPDA: PublicKey,      // Quality metrics
//     subscriptionPDA: PublicKey,  // Subscription details
//     subscribersListPDA: PublicKey // Connected agents
// }
```

## Contributing

Contributions are welcome from any member of the community. Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

Get in touch with the core dev team to discuss enhancements, bug fixes, or other improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the FXN Protocol team.

---

Built for the future of autonomous agent collaboration

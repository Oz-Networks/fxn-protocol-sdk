# OZ Protocol SDK

A TypeScript SDK for interacting with the OZ Protocol smart contracts.

## Installation
```bash
npm install oz-protocol-sdk
```

## Initialization

```typescript
import { 
  CollectorClient,
  CollectorFactoryClient, 
  SubscriptionManagerClient 
} from 'oz-protocol-sdk';

// Initialize clients
const factory = new CollectorFactoryClient(rpcUrl);
const collector = new CollectorClient(rpcUrl);
const subscription = new SubscriptionManagerClient(rpcUrl);

// Initialize with contract addresses and private key
await factory.initialize(factoryAddress, privateKey);
await collector.initialize(collectorAddress, privateKey);
await subscription.initialize(subscriptionAddress, privateKey);
```

## CollectorClient
NFT management functions:
```typescript
// Mint new NFT
await collector.mint(recipientAddress);

// Check NFT balance
const balance = await collector.balanceOf(address);

// Get NFT owner
const owner = await collector.ownerOf(tokenId);
```

## CollectorFactoryClient
Factory management functions:
```typescript
// Create new collector
const address = await factory.createCollector(nftAddress, feePerDay, collectorFee);

// Manage collectors
await factory.handleCollectorCreator(creatorAddress, active);
await factory.handleReputationProvider(providerAddress, active);
await factory.handleCollectorValidity(collectorAddress, validity);

// List collectors
const validCollectors = await factory.listCollectorsByValidation(true);
const invalidCollectors = await factory.listCollectorsByValidation(false);

// Reputation management
const score = await factory.getReputationScore(collector, dataProvider);
await factory.requestReputation(collector, dataProvider);
await factory.storeReputationScore(collector, dataProvider, score);
```

## SubscriptionManagerClient
Subscription management functions:
```typescript
// Create subscription
await subscription.subscribe({
  dataProvider,
  recipient,
  endTime,
  value
});

// Calculate fees
const fees = await subscription.calculateFees(durationInDays);

// Get subscription info
const subscribers = await subscription.getSubscribers(dataProvider);
const feePerDay = await subscription.getFeePerDay();
const collectorFee = await subscription.getCollectorFee();
```

## Error Handling
The SDK includes built-in error handling for contract interactions. Errors are mapped to human-readable messages using `ERROR_SIGNATURES`.

## Types
TypeScript types are included for all parameters and return values.

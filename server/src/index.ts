// server/src/index.ts
import express from 'express';
import { SolanaAdapter } from '../../src/client/fxn-solana-adapter';
import { AnchorProvider } from '@coral-xyz/anchor';
import {Connection, PublicKey} from '@solana/web3.js';

const app = express();
app.use(express.json());

const DEFAULT_RPC_ENDPOINT = "https://api.devnet.solana.com";
const DEFAULT_COMMITMENT = "confirmed";

// Helper to create SolanaAdapter instance from request
const getAdapter = (provider: any) => {
    if (!provider) {
        throw new Error('Provider details are required');
    }
    if (!provider.connection) {
        throw new Error('Provider connection details are required');
    }
    if (!provider.wallet) {
        throw new Error('Provider wallet details are required');
    }

    console.log('Creating adapter with provider:', JSON.stringify(provider, null, 2));

    return new SolanaAdapter(new AnchorProvider(
        provider.connection,
        provider.wallet,
        provider.opts || {}
    ));
};

const createDefaultProvider = (publicKeyStr: string) => {
    // Create connection
    const connection = new Connection(DEFAULT_RPC_ENDPOINT, DEFAULT_COMMITMENT);

    // Create a minimal wallet adapter
    const wallet = {
        publicKey: new PublicKey(publicKeyStr),
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs
    };

    // Create and return provider
    return new AnchorProvider(
        connection,
        wallet,
        { commitment: DEFAULT_COMMITMENT }
    );
};

// Register Agent endpoint
app.post('/agent', async (req, res) => {
    try {
        const { 
            provider, 
            name, 
            description, 
            restrict_subscriptions, 
            textPosts,
            imagePosts,
            videoPosts,
            telegram,
            twitter,
            discord,
            fee
        } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.registerAgent({
            name,
            description,
            restrict_subscriptions,
            text: textPosts,
            photo: imagePosts,
            video: videoPosts,
            telegram,
            twitter,
            discord,
            fee,
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Edit Agent endpoint
app.put('/agent', async (req, res) => {
    try {
        const { 
            provider, 
            dataProvider, 
            name, 
            description, 
            restrict_subscriptions, 
            textPosts,
            imagePosts,
            videoPosts,
            telegram,
            twitter,
            discord,
            fee
        } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.editAgentDetails({
            name,
            description,
            restrict_subscriptions,
            text: textPosts,
            photo: imagePosts,
            video: videoPosts,
            telegram,
            twitter,
            discord,
            fee,
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Request Subscription endpoint
app.post('/subscribe/request', async (req, res) => {
    try {
        const { 
            provider, 
            dataProvider, 
        } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.requestSubscription({
            dataProvider: new PublicKey(dataProvider),
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Approve Subscription endpoint
app.post('/subscribe/approve', async (req, res) => {
    try {
        const { 
            provider, 
            subscriberAddress,
            requestIndex
        } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.approveSubscriptionRequest({
            subscriberAddress,
            requestIndex
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Subscribe endpoint
app.post('/subscribe', async (req, res) => {
    try {
        const { provider, dataProvider, recipient, durationInDays } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.createSubscription({
            dataProvider: new PublicKey(dataProvider),
            recipient,
            durationInDays,
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Renew endpoint
app.post('/renew', async (req, res) => {
    try {
        const { provider, dataProvider, newRecipient, newEndTime, qualityScore, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.renewSubscription({
            dataProvider: new PublicKey(dataProvider),
            newRecipient,
            newEndTime,
            qualityScore,
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cancel endpoint
app.post('/cancel', async (req, res) => {
    try {
        const { provider, dataProvider, qualityScore, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.cancelSubscription({
            dataProvider: new PublicKey(dataProvider),
            qualityScore,
            nftTokenAccount: nftTokenAccount ? new PublicKey(nftTokenAccount) : undefined
        });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get subscriptions for provider
app.get('/subscriptions/provider/:providerAddress', async (req, res) => {
    console.log('Received request for provider subscriptions');
    console.log('Provider address:', req.params.providerAddress);

    try {
        const { providerAddress } = req.params;

        // Create provider and adapter
        const provider = createDefaultProvider(providerAddress);
        const adapter = new SolanaAdapter(provider);

        console.log('Created adapter, fetching subscriptions...');

        const result = await adapter.getSubscriptionsForProvider(
            new PublicKey(providerAddress)
        );

        console.log('Got result:', result);

        res.json({ success: true, subscriptions: result });
    } catch (error: any) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            details: error.stack
        });
    }
});

// Get subscriptions for user
app.get('/subscriptions/user/:userAddress', async (req, res) => {
    try {
        const { provider } = req.body;
        const { userAddress } = req.params;
        const adapter = getAdapter(provider);

        const result = await adapter.getAllSubscriptionsForUser(
            new PublicKey(userAddress)
        );

        res.json({ success: true, subscriptions: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Set fee
app.post('/fee', async (req, res) => {
    try {
        const { provider, fee } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.setDataProviderFee({ fee });

        res.json({ success: true, signature: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port2 ${PORT}`);
});

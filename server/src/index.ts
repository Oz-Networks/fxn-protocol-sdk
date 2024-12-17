// server/src/index.ts
import express from 'express';
import { SolanaAdapter } from '../../src/client/fxn-solana-adapter';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

const app = express();
app.use(express.json());

// Helper to create SolanaAdapter instance from request
const getAdapter = (provider: any) => {
    return new SolanaAdapter(new AnchorProvider(
        provider.connection,
        provider.wallet,
        provider.opts
    ));
};

// Subscribe endpoint
app.post('/subscribe', async (req, res) => {
    try {
        const { provider, dataProvider, recipient, durationInDays, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);

        const result = await adapter.createSubscription({
            dataProvider: new PublicKey(dataProvider),
            recipient,
            durationInDays,
            nftTokenAccount: new PublicKey(nftTokenAccount)
        });

        res.json({ success: true, signature: result });
    } catch (error) {
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
            nftTokenAccount: new PublicKey(nftTokenAccount)
        });

        res.json({ success: true, signature: result });
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get subscriptions for provider
app.get('/subscriptions/provider/:providerAddress', async (req, res) => {
    try {
        const { provider } = req.body;
        const { providerAddress } = req.params;
        const adapter = getAdapter(provider);

        const result = await adapter.getSubscriptionsForProvider(
            new PublicKey(providerAddress)
        );

        res.json({ success: true, subscriptions: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

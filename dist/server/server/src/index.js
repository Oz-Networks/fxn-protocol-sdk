"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const fxn_solana_adapter_1 = require("../../src/client/fxn-solana-adapter");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Helper to create SolanaAdapter instance from request
const getAdapter = (provider) => {
    return new fxn_solana_adapter_1.SolanaAdapter(new anchor_1.AnchorProvider(provider.connection, provider.wallet, provider.opts));
};
// Subscribe endpoint
app.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, dataProvider, recipient, durationInDays, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);
        const result = yield adapter.createSubscription({
            dataProvider: new web3_js_1.PublicKey(dataProvider),
            recipient,
            durationInDays,
            nftTokenAccount: new web3_js_1.PublicKey(nftTokenAccount)
        });
        res.json({ success: true, signature: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Renew endpoint
app.post('/renew', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, dataProvider, newRecipient, newEndTime, qualityScore, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);
        const result = yield adapter.renewSubscription({
            dataProvider: new web3_js_1.PublicKey(dataProvider),
            newRecipient,
            newEndTime,
            qualityScore,
            nftTokenAccount: new web3_js_1.PublicKey(nftTokenAccount)
        });
        res.json({ success: true, signature: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Cancel endpoint
app.post('/cancel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, dataProvider, qualityScore, nftTokenAccount } = req.body;
        const adapter = getAdapter(provider);
        const result = yield adapter.cancelSubscription({
            dataProvider: new web3_js_1.PublicKey(dataProvider),
            qualityScore,
            nftTokenAccount: nftTokenAccount ? new web3_js_1.PublicKey(nftTokenAccount) : undefined
        });
        res.json({ success: true, signature: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Get subscriptions for provider
app.get('/subscriptions/provider/:providerAddress', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider } = req.body;
        const { providerAddress } = req.params;
        const adapter = getAdapter(provider);
        const result = yield adapter.getSubscriptionsForProvider(new web3_js_1.PublicKey(providerAddress));
        res.json({ success: true, subscriptions: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Get subscriptions for user
app.get('/subscriptions/user/:userAddress', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider } = req.body;
        const { userAddress } = req.params;
        const adapter = getAdapter(provider);
        const result = yield adapter.getAllSubscriptionsForUser(new web3_js_1.PublicKey(userAddress));
        res.json({ success: true, subscriptions: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Set fee
app.post('/fee', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, fee } = req.body;
        const adapter = getAdapter(provider);
        const result = yield adapter.setDataProviderFee({ fee });
        res.json({ success: true, signature: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

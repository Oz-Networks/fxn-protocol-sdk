"use strict";
// src/adapters/solana-adapter.ts
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
exports.SolanaAdapter = exports.SubscriptionErrorCode = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const spl_token_2 = require("@solana/spl-token");
const subscription_manager_json_1 = __importDefault(require("../types/idl/subscription_manager.json"));
const index_1 = require("../config/index");
// Enhanced error types
var SubscriptionErrorCode;
(function (SubscriptionErrorCode) {
    SubscriptionErrorCode[SubscriptionErrorCode["PeriodTooShort"] = 6000] = "PeriodTooShort";
    SubscriptionErrorCode[SubscriptionErrorCode["AlreadySubscribed"] = 6001] = "AlreadySubscribed";
    SubscriptionErrorCode[SubscriptionErrorCode["InsufficientPayment"] = 6002] = "InsufficientPayment";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidTokenAccount"] = 6003] = "InvalidTokenAccount";
    SubscriptionErrorCode[SubscriptionErrorCode["SubscriptionNotFound"] = 6004] = "SubscriptionNotFound";
    SubscriptionErrorCode[SubscriptionErrorCode["QualityOutOfRange"] = 6005] = "QualityOutOfRange";
    SubscriptionErrorCode[SubscriptionErrorCode["SubscriptionAlreadyEnded"] = 6006] = "SubscriptionAlreadyEnded";
    SubscriptionErrorCode[SubscriptionErrorCode["ActiveSubscription"] = 6007] = "ActiveSubscription";
    SubscriptionErrorCode[SubscriptionErrorCode["NotOwner"] = 6008] = "NotOwner";
    SubscriptionErrorCode[SubscriptionErrorCode["TooManyRequests"] = 6009] = "TooManyRequests";
    SubscriptionErrorCode[SubscriptionErrorCode["NoSubscriptionRequest"] = 6010] = "NoSubscriptionRequest";
    SubscriptionErrorCode[SubscriptionErrorCode["RequestNotApproved"] = 6011] = "RequestNotApproved";
    SubscriptionErrorCode[SubscriptionErrorCode["Unauthorized"] = 6012] = "Unauthorized";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidDataProvider"] = 6013] = "InvalidDataProvider";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidDataProviderFeeAccount"] = 6014] = "InvalidDataProviderFeeAccount";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidOwnerFeeAccount"] = 6015] = "InvalidOwnerFeeAccount";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidDataProviderPaymentAccount"] = 6016] = "InvalidDataProviderPaymentAccount";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidOwnerPaymentAccount"] = 6017] = "InvalidOwnerPaymentAccount";
    SubscriptionErrorCode[SubscriptionErrorCode["TooManySubscriptions"] = 6018] = "TooManySubscriptions";
    SubscriptionErrorCode[SubscriptionErrorCode["TooManySubscribers"] = 6019] = "TooManySubscribers";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidIndex"] = 6020] = "InvalidIndex";
    SubscriptionErrorCode[SubscriptionErrorCode["AlreadyApproved"] = 6021] = "AlreadyApproved";
    SubscriptionErrorCode[SubscriptionErrorCode["InvalidSubscriber"] = 6022] = "InvalidSubscriber";
})(SubscriptionErrorCode || (exports.SubscriptionErrorCode = SubscriptionErrorCode = {}));
class SolanaAdapter {
    constructor(provider) {
        if (!index_1.config.subscriptionManagerAddress) {
            throw new Error('Program ID not found in environment variables');
        }
        this.provider = provider;
        this.program = new anchor_1.Program(subscription_manager_json_1.default, provider);
    }
    registerAgent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const dataProvider = this.provider.wallet.publicKey;
                const [agentRegistrationPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("agent_profile_registration"), dataProvider.toBuffer()], this.program.programId);
                const [subscriptionRequestsPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscription_requests"), dataProvider.toBuffer()], this.program.programId);
                const [dataProviderFeePDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("data_provider_fee"), dataProvider.toBuffer()], this.program.programId);
                const [statePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("state storage")], this.program.programId);
                const fxnMintAddress = new web3_js_1.PublicKey(index_1.config.fxnMintAddress);
                const dp_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, dataProvider);
                const fee = new anchor_1.BN(params.fee * web3_js_1.LAMPORTS_PER_SOL);
                const txHash = yield this.program.methods
                    .registerAgent(params.name, params.description, params.restrict_subscriptions, params.capabilities, fee)
                    .accounts({
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    dataProviderFee: dataProviderFeePDA,
                    dataProviderPaymentAta: dp_payment_ata,
                    dataProvider: dataProvider,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    tokenMintAccount: fxnMintAddress,
                    state: statePDA,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error registering agent:', error);
                throw this.handleError(error);
            }
        });
    }
    editAgentDetails(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const dataProvider = this.provider.wallet.publicKey;
                const [agentRegistrationPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("agent_profile_registration"), dataProvider.toBuffer()], this.program.programId);
                const [subscriptionRequestsPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscription_requests"), dataProvider.toBuffer()], this.program.programId);
                const [dataProviderFeePDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("data_provider_fee"), dataProvider.toBuffer()], this.program.programId);
                const fee = new anchor_1.BN(params.fee * web3_js_1.LAMPORTS_PER_SOL);
                const txHash = yield this.program.methods
                    .editAgentData(params.name, params.description, params.restrict_subscriptions, params.capabilities, fee)
                    .accounts({
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    dataProviderFee: dataProviderFeePDA,
                    dataProvider: dataProvider,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error registering agent:', error);
                throw this.handleError(error);
            }
        });
    }
    requestSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                const txHash = yield this.program.methods
                    .requestSubscription()
                    .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscriptionRequests: pdas.subscriptionRequestsPDA,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error requesting subscription:', error);
                throw this.handleError(error);
            }
        });
    }
    approveSubscriptionRequest(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const dataProvider = this.provider.wallet.publicKey;
                const [subscriptionRequestsPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscription_requests"), dataProvider.toBuffer()], this.program.programId);
                const txHash = yield this.program.methods
                    .approveRequest(new anchor_1.BN(params.requestIndex))
                    .accounts({
                    subscriber: params.subscriberAddress,
                    dataProvider: dataProvider,
                    subscriptionRequests: subscriptionRequestsPDA,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error approving subscription request:', error);
                throw this.handleError(error);
            }
        });
    }
    // adapters/solana-adapter.ts
    setDataProviderFee(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const dataProvider = this.provider.wallet.publicKey;
                const [dataProviderFeePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("data_provider_fee"), dataProvider.toBuffer()], this.program.programId);
                const fee = new anchor_1.BN(params.fee * web3_js_1.LAMPORTS_PER_SOL);
                const txHash = yield this.program.methods
                    .setDataProviderFee(fee)
                    .accounts({
                    dataProviderFee: dataProviderFeePDA,
                    dataProvider: dataProvider,
                    SystemProgram: web3_js_1.SystemProgram.programId,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error setting data provider fee:', error);
                throw this.handleError(error);
            }
        });
    }
    createSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                const [subscriptionRequestsPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscription_requests"), params.dataProvider.toBuffer()], this.program.programId);
                const [agentRegistrationPDA] = yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("agent_registration"), params.dataProvider.toBuffer()], this.program.programId);
                // Get the state account to get the correct owner
                const state = yield this.program.account.state.fetch(pdas.statePDA);
                // Get the associated token accounts for the payment
                const fxnMintAddress = new web3_js_1.PublicKey(index_1.config.fxnMintAddress);
                const dp_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, params.dataProvider);
                const subscriber_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, subscriber);
                const owner_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, state.owner);
                const txHash = yield this.program.methods
                    .subscribe(params.recipient, new anchor_1.BN(Math.floor(Date.now() / 1000) + (params.durationInDays * 24 * 60 * 60)))
                    .accounts({
                    state: pdas.statePDA,
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    owner: state.owner,
                    dataProviderPaymentAta: dp_payment_ata,
                    subscriberPaymentAta: subscriber_payment_ata,
                    ownerPaymentAta: owner_payment_ata,
                    agentRegistration: agentRegistrationPDA,
                    subscriptionRequests: subscriptionRequestsPDA,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                })
                    .rpc();
                const subscriptionListTxHash = yield this.subscriptionLists({ dataProvider: params.dataProvider });
                return [txHash, subscriptionListTxHash];
            }
            catch (error) {
                console.error('Error creating subscription:', error);
                throw this.handleError(error);
            }
        });
    }
    subscriptionLists(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                const mySubscriptionsAccount = yield this.provider.connection.getAccountInfo(pdas.mySubscriptionsPDA);
                const subscribersListAccount = yield this.provider.connection.getAccountInfo(pdas.subscribersListPDA);
                const listParams = {
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    mySubscriptionsPDA: pdas.mySubscriptionsPDA,
                    subscribersListPDA: pdas.subscribersListPDA,
                };
                let txHash;
                if (!!mySubscriptionsAccount && !!subscribersListAccount) {
                    if (mySubscriptionsAccount.data.length < 8 + 4 + (200 * 32) || subscribersListAccount.data.length < 8 + 4 + (200 * 32)) {
                        txHash = yield this.reallocSubscriptionLists(listParams);
                    }
                    else {
                        txHash = yield this.addSubscriptionsLists(listParams);
                    }
                }
                else {
                    if (!!mySubscriptionsAccount) {
                        yield this.initSubscribersList(listParams);
                        txHash = yield this.reallocSubscriptionLists(listParams);
                    }
                    else if (!!subscribersListAccount) {
                        yield this.initMySubscriptionsList(listParams);
                        txHash = yield this.reallocSubscriptionLists(listParams);
                    }
                    else {
                        yield this.initMySubscriptionsList(listParams);
                        yield this.initSubscribersList(listParams);
                        txHash = yield this.reallocSubscriptionLists(listParams);
                    }
                }
                return txHash;
            }
            catch (error) {
                console.error('Error creating / adding to subscription lists:', error);
                throw this.handleError(error);
            }
        });
    }
    reallocSubscriptionLists(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.program.methods
                .reallocAddSubscriptionsLists()
                .accounts({
                subscriber: params.subscriber,
                dataProvider: params.dataProvider,
                mySubscriptions: params.mySubscriptionsPDA,
                subscribersList: params.subscribersListPDA,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            return tx;
        });
    }
    initMySubscriptionsList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.program.methods
                .initMySubscriptionsList()
                .accounts({
                subscriber: params.subscriber,
                dataProvider: params.dataProvider,
                mySubscriptions: params.mySubscriptionsPDA,
                subscribersList: params.subscribersListPDA,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            return tx;
        });
    }
    initSubscribersList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.program.methods
                .initSubscribersList()
                .accounts({
                subscriber: params.subscriber,
                dataProvider: params.dataProvider,
                mySubscriptions: params.mySubscriptionsPDA,
                subscribersList: params.subscribersListPDA,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            return tx;
        });
    }
    addSubscriptionsLists(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.program.methods
                .addSubscriptionsLists()
                .accounts({
                subscriber: params.subscriber,
                dataProvider: params.dataProvider,
                mySubscriptions: params.mySubscriptionsPDA,
                subscribersList: params.subscribersListPDA,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            return tx;
        });
    }
    getSubscriptionStatus(endTime) {
        const now = Math.floor(Date.now() / 1000);
        const endTimeSeconds = endTime.toNumber();
        const daysUntilExpiration = (endTimeSeconds - now) / (24 * 60 * 60);
        if (endTimeSeconds <= now) {
            return 'expired';
        }
        else if (daysUntilExpiration <= 7) {
            return 'expiring_soon';
        }
        return 'active';
    }
    getSubscriptionsForProvider(providerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the subscribers list PDA
                const [subscribersListPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), providerPublicKey.toBuffer()], this.program.programId);
                // Get the list of subscribers
                const subscribersList = yield this.program.account.subscribersList.fetch(subscribersListPDA);
                // Get subscription details for each subscriber
                const subscriptions = yield Promise.all(subscribersList.subscribers.map((subscriber) => __awaiter(this, void 0, void 0, function* () {
                    // Calculate subscription PDA for this subscriber
                    const [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                        Buffer.from("subscription"),
                        subscriber.toBuffer(),
                        providerPublicKey.toBuffer()
                    ], this.program.programId);
                    try {
                        const subscription = yield this.program.account.subscription.fetch(subscriptionPDA);
                        return {
                            subscriber,
                            subscriptionPDA,
                            subscription,
                            status: this.getSubscriptionStatus(subscription.endTime)
                        };
                    }
                    catch (error) {
                        console.error('No subscription found for subscriber:', subscriber.toString());
                        return null;
                    }
                })));
                // Filter out null values and sort by active status
                return subscriptions
                    .filter((sub) => sub !== null &&
                    sub.subscription.endTime.gt(new anchor_1.BN(Math.floor(Date.now() / 1000))))
                    .sort((a, b) => b.subscription.endTime.sub(a.subscription.endTime).toNumber());
            }
            catch (error) {
                console.error('Error getting provider subscriptions:', error);
                throw this.handleError(error);
            }
        });
    }
    getAllSubscriptionsForUser(userPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the mySubscriptions PDA
                const [mySubscriptionsPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("my_subscriptions"), userPublicKey.toBuffer()], this.program.programId);
                // Fetch the mySubscriptions account
                const mySubscriptions = yield this.program.account.mySubscriptions.fetch(mySubscriptionsPDA);
                // Map over each data provider and get their subscription details
                const subscriptions = yield Promise.all(mySubscriptions.providers.map((dataProvider) => __awaiter(this, void 0, void 0, function* () {
                    // Calculate subscription PDA for this provider
                    const [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                        Buffer.from("subscription"),
                        userPublicKey.toBuffer(),
                        dataProvider.toBuffer()
                    ], this.program.programId);
                    try {
                        // Fetch the subscription account
                        const subscription = yield this.program.account.subscription.fetch(subscriptionPDA);
                        return {
                            dataProvider,
                            subscription: subscriptionPDA,
                            endTime: subscription.endTime,
                            recipient: subscription.recipient,
                            status: this.getSubscriptionStatus(subscription.endTime)
                        };
                    }
                    catch (error) {
                        console.error(`Error fetching subscription for provider ${dataProvider.toString()}:`, error);
                        return null;
                    }
                })));
                // Filter out null values (failed fetches) and expired subscriptions
                // Sort by end time descending (most recent first)
                return subscriptions
                    .filter((sub) => sub !== null &&
                    sub.endTime.gt(new anchor_1.BN(Math.floor(Date.now() / 1000))))
                    .sort((a, b) => b.endTime.sub(a.endTime).toNumber());
            }
            catch (error) {
                console.error('Error fetching user subscriptions:', error);
                throw this.handleError(error);
            }
        });
    }
    renewSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                // Initialize quality info if it doesn't exist
                try {
                    yield this.program.account.qualityInfo.fetch(pdas.qualityPDA);
                }
                catch (e) {
                    yield this.program.methods
                        .initializeQualityInfo()
                        .accounts({
                        qualityInfo: pdas.qualityPDA,
                        dataProvider: params.dataProvider,
                        payer: subscriber,
                        systemProgram: web3_js_1.SystemProgram.programId,
                    })
                        .rpc();
                }
                // Get the state account to verify the owner
                const state = yield this.program.account.state.fetch(pdas.statePDA);
                // Get the associated token accounts for the payment
                const fxnMintAddress = new web3_js_1.PublicKey(index_1.config.fxnMintAddress);
                const dp_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, params.dataProvider);
                const subscriber_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, subscriber);
                const owner_payment_ata = yield (0, spl_token_1.getAssociatedTokenAddress)(fxnMintAddress, state.owner);
                // Send renewal transaction
                const txHash = yield this.program.methods
                    .renewSubscription(params.newRecipient, new anchor_1.BN(params.newEndTime), params.qualityScore)
                    .accounts({
                    state: pdas.statePDA,
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                    owner: state.owner,
                    dataProviderPaymentAta: dp_payment_ata,
                    subscriberPaymentAta: subscriber_payment_ata,
                    ownerPaymentAta: owner_payment_ata,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                    dpFeeAccount: pdas.dataProviderFeePDA,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error in renewSubscription:', error);
                throw this.handleError(error);
            }
        });
    }
    cancelSubscription(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider.wallet.publicKey) {
                throw new Error("Wallet not connected");
            }
            try {
                const subscriber = this.provider.wallet.publicKey;
                const pdas = this.getProgramAddresses(params.dataProvider, subscriber);
                const txHash = yield this.program.methods
                    .cancelSubscription(params.qualityScore)
                    .accounts({
                    subscriber: subscriber,
                    dataProvider: params.dataProvider,
                    subscription: pdas.subscriptionPDA,
                    qualityInfo: pdas.qualityPDA,
                })
                    .rpc();
                return txHash;
            }
            catch (error) {
                console.error('Error in cancelSubscription:', error);
                throw this.handleError(error);
            }
        });
    }
    getSubscriptionState(subscriptionPDA) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.program.account.subscription.fetch(subscriptionPDA);
            }
            catch (error) {
                console.error('Error fetching subscription state:', error);
                throw this.handleError(error);
            }
        });
    }
    getQualityInfo(dataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [qualityPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.toBuffer()], this.program.programId);
                return yield this.program.account.qualityInfo.fetch(qualityPDA);
            }
            catch (error) {
                console.error('Error fetching quality info:', error);
                throw this.handleError(error);
            }
        });
    }
    getProgramAddresses(dataProvider, subscriber) {
        const [statePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("state storage")], this.program.programId);
        const [qualityPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.toBuffer()], this.program.programId);
        const [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("subscription"),
            subscriber.toBuffer(),
            dataProvider.toBuffer(),
        ], this.program.programId);
        const [subscribersListPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), dataProvider.toBuffer()], this.program.programId);
        const [dataProviderFeePDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("data_provider_fee"), dataProvider.toBuffer()], this.program.programId);
        const [mySubscriptionsPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("my_subscriptions"), subscriber.toBuffer()], this.program.programId);
        const [subscriptionRequestsPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscription_requests"), dataProvider.toBuffer()], this.program.programId);
        return {
            statePDA,
            qualityPDA,
            subscriptionPDA,
            subscribersListPDA,
            dataProviderFeePDA,
            mySubscriptionsPDA,
            subscriptionRequestsPDA,
        };
    }
    handleError(error) {
        // Check if it's a program error with a code
        if (error.code !== undefined) {
            switch (error.code) {
                case SubscriptionErrorCode.PeriodTooShort:
                    return new Error('Subscription period is too short');
                case SubscriptionErrorCode.AlreadySubscribed:
                    return new Error('Already subscribed');
                case SubscriptionErrorCode.InsufficientPayment:
                    return new Error('Insufficient payment');
                case SubscriptionErrorCode.InvalidTokenAccount:
                    return new Error('Invalid token account');
                case SubscriptionErrorCode.SubscriptionNotFound:
                    return new Error('Subscription not found');
                case SubscriptionErrorCode.QualityOutOfRange:
                    return new Error('Quality score must be between 0 and 100');
                case SubscriptionErrorCode.SubscriptionAlreadyEnded:
                    return new Error('Subscription has already ended');
                case SubscriptionErrorCode.ActiveSubscription:
                    return new Error('Subscription is still active');
                case SubscriptionErrorCode.NotOwner:
                    return new Error('Not the contract owner');
                case SubscriptionErrorCode.TooManyRequests:
                    return new Error('Too many subscription requests');
                case SubscriptionErrorCode.NoSubscriptionRequest:
                    return new Error('No subscription request found');
                case SubscriptionErrorCode.RequestNotApproved:
                    return new Error('Subscription request not approved');
                case SubscriptionErrorCode.Unauthorized:
                    return new Error('Unauthorized');
                case SubscriptionErrorCode.InvalidDataProvider:
                    return new Error('Invalid data provider');
                case SubscriptionErrorCode.InvalidDataProviderFeeAccount:
                    return new Error('Invalid data provider fee account');
                case SubscriptionErrorCode.InvalidOwnerFeeAccount:
                    return new Error('Invalid owner fee account');
                case SubscriptionErrorCode.InvalidDataProviderPaymentAccount:
                    return new Error('Invalid data provider payment account');
                case SubscriptionErrorCode.InvalidOwnerPaymentAccount:
                    return new Error('Invalid owner payment account');
                case SubscriptionErrorCode.TooManySubscriptions:
                    return new Error('Too many subscriptions');
                case SubscriptionErrorCode.TooManySubscribers:
                    return new Error('Too many subscribers');
                case SubscriptionErrorCode.InvalidIndex:
                    return new Error('Invalid index');
                case SubscriptionErrorCode.AlreadyApproved:
                    return new Error('Already approved');
                case SubscriptionErrorCode.InvalidSubscriber:
                    return new Error('Invalid subscriber');
                default:
                    return new Error(`Unknown error: ${error.message}`);
            }
        }
        // If it's not a program error, return the original error
        return error instanceof Error ? error : new Error(String(error));
    }
}
exports.SolanaAdapter = SolanaAdapter;

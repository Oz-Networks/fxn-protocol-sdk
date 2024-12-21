"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("Subscription Manager Tests", () => {
    // Set up anchor provider and program
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    // Get our program from the workspace
    const program = anchor.workspace.SubscriptionManager;
    // Create keypairs for different roles
    const owner = web3_js_1.Keypair.generate();
    const dataProvider = web3_js_1.Keypair.generate();
    const subscriber = web3_js_1.Keypair.generate();
    // Store important accounts
    let nftMint;
    let providerTokenAccount;
    let statePDA;
    let subscriptionPDA;
    let qualityPDA;
    let subscribersListPDA;
    let stateAccountBump;
    let qualityBump;
    // Constants for testing
    const MAX_QUALITY_RECORDS = 10;
    const SUBSCRIPTION_PERIOD = 7 * 24 * 60 * 60; // 1 week in seconds
    const INITIAL_FEE_PER_DAY = new anchor.BN(50000000);
    const INITIAL_COLLECTOR_FEE = new anchor.BN(50000000);
    (0, mocha_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Setting up test environment...");
        // Derive program PDAs with bumps
        [statePDA, stateAccountBump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("storage")], program.programId);
        [qualityPDA, qualityBump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.publicKey.toBuffer()], program.programId);
        [subscriptionPDA] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("subscription"),
            subscriber.publicKey.toBuffer(),
            dataProvider.publicKey.toBuffer(),
        ], program.programId);
        [subscribersListPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("subscribers"), dataProvider.publicKey.toBuffer()], program.programId);
        // Airdrop SOL to test accounts
        function airdropToAccount(keypair, amount) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // First, get the latest blockhash before sending the airdrop request
                    const latestBlockhash = yield provider.connection.getLatestBlockhash();
                    // Request the airdrop
                    const signature = yield provider.connection.requestAirdrop(keypair.publicKey, amount * web3_js_1.LAMPORTS_PER_SOL);
                    // Create the confirmation strategy object
                    const confirmationStrategy = {
                        signature, // The transaction signature we want to confirm
                        blockhash: latestBlockhash.blockhash, // The blockhash used for confirmation
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight // The last block height where this transaction is valid
                    };
                    // Wait for transaction confirmation using the new strategy
                    const confirmation = yield provider.connection.confirmTransaction(confirmationStrategy);
                    // Check if the transaction was successful
                    if (confirmation.value.err) {
                        throw new Error(`Airdrop failed: ${confirmation.value.err}`);
                    }
                    console.log(`Successfully airdropped ${amount} SOL to ${keypair.publicKey.toString()}`);
                    console.log(`Transaction signature: ${signature}`);
                    // Optional: Add a delay to ensure the balance is updated
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                    // Verify the balance was updated
                    const balance = yield provider.connection.getBalance(keypair.publicKey);
                    console.log(`New balance: ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
                }
                catch (error) {
                    console.error('Airdrop failed:', error);
                    throw new Error(`Failed to airdrop ${amount} SOL to ${keypair.publicKey.toString()}: ${error.message}`);
                }
            });
        }
        // Fund all our test accounts
        yield Promise.all([
            airdropToAccount(owner, 20),
            airdropToAccount(dataProvider, 10),
            airdropToAccount(subscriber, 10),
        ]);
        // Set up NFT for data provider
        nftMint = yield (0, spl_token_1.createMint)(provider.connection, owner, owner.publicKey, null, 0, undefined, { commitment: "confirmed" }, spl_token_1.TOKEN_PROGRAM_ID);
        // Create token account for data provider
        providerTokenAccount = yield (0, spl_token_1.createAccount)(provider.connection, dataProvider, nftMint, dataProvider.publicKey);
        // Mint one NFT to the data provider
        yield (0, spl_token_1.mintTo)(provider.connection, owner, nftMint, providerTokenAccount, owner, 1);
    }));
    (0, mocha_1.it)("Initializes the program state", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Initializing program state...");
        console.log("Owner:", owner.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("State PDA:", statePDA.toString());
        console.log("-----------------------------");
        try {
            const tx = yield program.methods
                .initialize()
                .accounts({
                state: statePDA,
                owner: owner.publicKey,
                nftProgram: nftMint,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .signers([owner])
                .rpc();
            // Verify the state was initialized correctly
            const stateAccount = yield program.account.state.fetch(statePDA);
            chai_1.assert.ok(stateAccount.owner.equals(owner.publicKey), "Owner not set correctly");
            chai_1.assert.ok(stateAccount.nftProgramId.equals(nftMint), "NFT program ID not set correctly");
            chai_1.assert.ok(stateAccount.feePerDay.eq(INITIAL_FEE_PER_DAY), "Fee per day not set correctly");
            chai_1.assert.ok(stateAccount.collectorFee.eq(INITIAL_COLLECTOR_FEE), "Collector fee not set correctly");
            console.log("Program initialized successfully");
        }
        catch (error) {
            console.error("Initialization failed:", error);
            throw error;
        }
    }));
    (0, mocha_1.it)("Creates a new subscription and Renews an the existing subscription", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // First, we need to create an initial subscription
            console.log("Creating initial subscription...");
            const currentTime = Math.floor(Date.now() / 1000);
            const initialEndTime = currentTime + SUBSCRIPTION_PERIOD;
            // Create initial subscription
            const createSubTx = yield program.methods
                .subscribe("https://your-cool-agent.com:3001", new anchor.BN(initialEndTime))
                .accounts({
                state: statePDA,
                subscriber: subscriber.publicKey,
                dataProvider: dataProvider.publicKey,
                subscription: subscriptionPDA,
                subscribersList: subscribersListPDA,
                owner: owner.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                nftTokenAccount: providerTokenAccount,
            })
                .signers([subscriber])
                .rpc();
            // Confirm the subscription creation
            let latestBlockhash = yield provider.connection.getLatestBlockhash();
            let confirmationStrategy = {
                signature: createSubTx,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            };
            yield provider.connection.confirmTransaction(confirmationStrategy);
            console.log("Initial subscription created successfully");
            // Now initialize the quality info account
            console.log("Initializing quality info account...");
            const [qualityPDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("quality"), dataProvider.publicKey.toBuffer()], program.programId);
            const initQualityTx = yield program.methods
                .initializeQualityInfo()
                .accounts({
                qualityInfo: qualityPDA,
                dataProvider: dataProvider.publicKey,
                payer: subscriber.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .signers([subscriber])
                .rpc();
            // Confirm quality info initialization
            latestBlockhash = yield provider.connection.getLatestBlockhash();
            confirmationStrategy = {
                signature: initQualityTx,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            };
            yield provider.connection.confirmTransaction(confirmationStrategy);
            console.log("Quality info account initialized successfully");
            // Now proceed with the subscription renewal
            console.log("Proceeding with subscription renewal...");
            const newEndTime = currentTime + (2 * SUBSCRIPTION_PERIOD);
            const newRecipient = "https://your-updated-agent.com:3001";
            const quality = 90;
            const renewTx = yield program.methods
                .renewSubscription(newRecipient, new anchor.BN(newEndTime), quality)
                .accounts({
                state: statePDA,
                subscriber: subscriber.publicKey,
                dataProvider: dataProvider.publicKey,
                subscription: subscriptionPDA,
                qualityInfo: qualityPDA,
                owner: owner.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                nftTokenAccount: providerTokenAccount,
            })
                .signers([subscriber])
                .rpc();
            // Confirm the renewal transaction
            latestBlockhash = yield provider.connection.getLatestBlockhash();
            confirmationStrategy = {
                signature: renewTx,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            };
            yield provider.connection.confirmTransaction(confirmationStrategy);
            // Verify the renewal was successful
            const subscription = yield program.account.subscription.fetch(subscriptionPDA);
            chai_1.assert.equal(subscription.recipient, newRecipient, "Recipient not updated");
            chai_1.assert.ok(subscription.endTime.eq(new anchor.BN(newEndTime)), "End time not updated");
            console.log("Subscription renewed successfully with quality rating stored");
        }
        catch (error) {
            console.error("Test failed with error:", error);
            if (error.logs) {
                console.error("Program logs:", error.logs);
            }
            throw error;
        }
    }));
    (0, mocha_1.it)("Cancels a subscription", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const quality = 85;
            const tx = yield program.methods
                .cancelSubscription(quality)
                .accounts({
                subscriber: subscriber.publicKey,
                dataProvider: dataProvider.publicKey,
                subscription: subscriptionPDA,
                qualityInfo: qualityPDA,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                nftTokenAccount: providerTokenAccount,
            })
                .signers([subscriber])
                .rpc();
            // Verify cancellation
            const subscription = yield program.account.subscription.fetch(subscriptionPDA);
            chai_1.assert.equal(subscription.recipient, "", "Recipient not cleared");
            chai_1.assert.ok(subscription.endTime.eq(new anchor.BN(0)), "End time not cleared");
            console.log("Subscription cancelled successfully");
        }
        catch (error) {
            console.error("Subscription cancellation failed:", error);
            throw error;
        }
    }));
    // Test error conditions
    (0, mocha_1.describe)("Error cases", () => {
        // it("Prevents subscription with invalid NFT", async () => {
        //   const invalidProvider = Keypair.generate();
        //   const currentTime = Math.floor(Date.now() / 1000);
        //   const endTime = currentTime + SUBSCRIPTION_PERIOD;
        //   try {
        //     await program.methods
        //       .subscribe("https://your-cool-agent.com:3001", new anchor.BN(endTime))
        //       .accounts({
        //         state: statePDA,
        //         subscriber: subscriber.publicKey,
        //         dataProvider: invalidProvider.publicKey,
        //         subscription: subscriptionPDA,
        //         subscribersList: subscribersListPDA,
        //         owner: owner.publicKey,
        //         systemProgram: SystemProgram.programId,
        //         tokenProgram: TOKEN_PROGRAM_ID,
        //         nftTokenAccount: providerTokenAccount,
        //       })
        //       .signers([subscriber])
        //       .rpc();
        //     assert.fail("Should have thrown error for invalid NFT");
        //   } catch (error) {
        //     assert.include(error.toString(), "InvalidNFTHolder");
        //   }
        // });
        (0, mocha_1.it)("Prevents invalid quality ratings", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield program.methods
                    .storeDataQuality(101) // Invalid quality > 100
                    .accounts({
                    subscriber: subscriber.publicKey,
                    dataProvider: dataProvider.publicKey,
                    qualityInfo: qualityPDA,
                })
                    .signers([subscriber])
                    .rpc();
                chai_1.assert.fail("Should have thrown error for invalid quality");
            }
            catch (error) {
                chai_1.assert.include(error.toString(), "QualityOutOfRange");
            }
        }));
    });
});

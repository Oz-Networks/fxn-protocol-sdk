import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionConfirmationStrategy,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo
} from "@solana/spl-token";
import { assert } from "chai";
import { describe, it, before } from "mocha";
import {SubscriptionManager} from "@/types/subscription_manager";

describe("Subscription Manager Tests", () => {
  // Set up anchor provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Get our program from the workspace
  const program = anchor.workspace.SubscriptionManager as Program<SubscriptionManager>;

  // Create keypairs for different roles
  const owner = Keypair.generate();
  const dataProvider = Keypair.generate();
  const subscriber = Keypair.generate();

  // Store important accounts
  let nftMint: PublicKey;
  let providerTokenAccount: PublicKey;
  let statePDA: PublicKey;
  let subscriptionPDA: PublicKey;
  let qualityPDA: PublicKey;
  let subscribersListPDA: PublicKey;
  let stateAccountBump: number;
  let qualityBump: number;

  // Constants for testing
  const MAX_QUALITY_RECORDS = 10;
  const SUBSCRIPTION_PERIOD = 7 * 24 * 60 * 60; // 1 week in seconds
  const INITIAL_FEE_PER_DAY = new anchor.BN(50000000);
  const INITIAL_COLLECTOR_FEE = new anchor.BN(50000000);

  before(async () => {
    console.log("Setting up test environment...");

    // Derive program PDAs with bumps
    [statePDA, stateAccountBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("storage")],
        program.programId
    );

    [qualityPDA, qualityBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("quality"), dataProvider.publicKey.toBuffer()],
        program.programId
    );

    [subscriptionPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("subscription"),
          subscriber.publicKey.toBuffer(),
          dataProvider.publicKey.toBuffer(),
        ],
        program.programId
    );

    [subscribersListPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("subscribers"), dataProvider.publicKey.toBuffer()],
        program.programId
    );

    // Airdrop SOL to test accounts
    async function airdropToAccount(keypair: Keypair, amount: number) {
      try {
        // First, get the latest blockhash before sending the airdrop request
        const latestBlockhash = await provider.connection.getLatestBlockhash();

        // Request the airdrop
        const signature = await provider.connection.requestAirdrop(
          keypair.publicKey,
          amount * LAMPORTS_PER_SOL
        );

        // Create the confirmation strategy object
        const confirmationStrategy: TransactionConfirmationStrategy = {
          signature,                           // The transaction signature we want to confirm
          blockhash: latestBlockhash.blockhash,  // The blockhash used for confirmation
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight  // The last block height where this transaction is valid
        };

        // Wait for transaction confirmation using the new strategy
        const confirmation = await provider.connection.confirmTransaction(confirmationStrategy);

        // Check if the transaction was successful
        if (confirmation.value.err) {
          throw new Error(`Airdrop failed: ${confirmation.value.err}`);
        }

        console.log(`Successfully airdropped ${amount} SOL to ${keypair.publicKey.toString()}`);
        console.log(`Transaction signature: ${signature}`);

        // Optional: Add a delay to ensure the balance is updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the balance was updated
        const balance = await provider.connection.getBalance(keypair.publicKey);
        console.log(`New balance: ${balance / LAMPORTS_PER_SOL} SOL`);

      } catch (error: any) {
        console.error('Airdrop failed:', error);
        throw new Error(`Failed to airdrop ${amount} SOL to ${keypair.publicKey.toString()}: ${error.message}`);
      }
    }

    // Fund all our test accounts
    await Promise.all([
      airdropToAccount(owner, 20),
      airdropToAccount(dataProvider, 10),
      airdropToAccount(subscriber, 10),
    ]);

    // Set up NFT for data provider
    nftMint = await createMint(
      provider.connection,
      owner,
      owner.publicKey,
      null,
      0,
      undefined,
      { commitment: "confirmed" },
      TOKEN_PROGRAM_ID
    );

    // Create token account for data provider
    providerTokenAccount = await createAccount(
      provider.connection,
      dataProvider,
      nftMint,
      dataProvider.publicKey
    );

    // Mint one NFT to the data provider
    await mintTo(
      provider.connection,
      owner,
      nftMint,
      providerTokenAccount,
      owner,
      1
    );
  });

  it("Initializes the program state", async () => {
    console.log("Initializing program state...");
    console.log("Owner:", owner.publicKey.toString());
    console.log("NFT Mint:", nftMint.toString());
    console.log("State PDA:", statePDA.toString());
    console.log("-----------------------------");
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          state: statePDA,
          owner: owner.publicKey,
          nftProgram: nftMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      // Verify the state was initialized correctly
      const stateAccount = await program.account.state.fetch(statePDA);
      assert.ok(stateAccount.owner.equals(owner.publicKey), "Owner not set correctly");
      assert.ok(stateAccount.nftProgramId.equals(nftMint), "NFT program ID not set correctly");
      assert.ok(stateAccount.feePerDay.eq(INITIAL_FEE_PER_DAY), "Fee per day not set correctly");
      assert.ok(stateAccount.collectorFee.eq(INITIAL_COLLECTOR_FEE), "Collector fee not set correctly");

      console.log("Program initialized successfully");
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
  });


  it("Creates a new subscription and Renews an the existing subscription", async () => {
    try {
      // First, we need to create an initial subscription
      console.log("Creating initial subscription...");
      const currentTime = Math.floor(Date.now() / 1000);
      const initialEndTime = currentTime + SUBSCRIPTION_PERIOD;

      // Create initial subscription
      const createSubTx = await program.methods
        .subscribe("https://your-cool-agent.com:3001", new anchor.BN(initialEndTime))
        .accounts({
          state: statePDA,
          subscriber: subscriber.publicKey,
          dataProvider: dataProvider.publicKey,
          subscription: subscriptionPDA,
          subscribersList: subscribersListPDA,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          nftTokenAccount: providerTokenAccount,
        })
        .signers([subscriber])
        .rpc();

      // Confirm the subscription creation
      let latestBlockhash = await provider.connection.getLatestBlockhash();
      let confirmationStrategy: TransactionConfirmationStrategy = {
        signature: createSubTx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };
      await provider.connection.confirmTransaction(confirmationStrategy);
      console.log("Initial subscription created successfully");

      // Now initialize the quality info account
      console.log("Initializing quality info account...");
      const [qualityPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("quality"), dataProvider.publicKey.toBuffer()],
        program.programId
      );

      const initQualityTx = await program.methods
        .initializeQualityInfo()
        .accounts({
          qualityInfo: qualityPDA,
          dataProvider: dataProvider.publicKey,
          payer: subscriber.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([subscriber])
        .rpc();

      // Confirm quality info initialization
      latestBlockhash = await provider.connection.getLatestBlockhash();
      confirmationStrategy = {
        signature: initQualityTx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };
      await provider.connection.confirmTransaction(confirmationStrategy);
      console.log("Quality info account initialized successfully");

      // Now proceed with the subscription renewal
      console.log("Proceeding with subscription renewal...");
      const newEndTime = currentTime + (2 * SUBSCRIPTION_PERIOD);
      const newRecipient = "https://your-updated-agent.com:3001";
      const quality = 90;

      const renewTx = await program.methods
        .renewSubscription(newRecipient, new anchor.BN(newEndTime), quality)
        .accounts({
          state: statePDA,
          subscriber: subscriber.publicKey,
          dataProvider: dataProvider.publicKey,
          subscription: subscriptionPDA,
          qualityInfo: qualityPDA,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          nftTokenAccount: providerTokenAccount,
        })
        .signers([subscriber])
        .rpc();

      // Confirm the renewal transaction
      latestBlockhash = await provider.connection.getLatestBlockhash();
      confirmationStrategy = {
        signature: renewTx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };
      await provider.connection.confirmTransaction(confirmationStrategy);

      // Verify the renewal was successful
      const subscription = await program.account.subscription.fetch(subscriptionPDA);
      assert.equal(subscription.recipient, newRecipient, "Recipient not updated");
      assert.ok(subscription.endTime.eq(new anchor.BN(newEndTime)), "End time not updated");

      console.log("Subscription renewed successfully with quality rating stored");

    } catch (error: any) {
      console.error("Test failed with error:", error);
      if (error.logs) {
        console.error("Program logs:", error.logs);
      }
      throw error;
    }
  });

  it("Cancels a subscription", async () => {
    try {
      const quality = 85;

      const tx = await program.methods
        .cancelSubscription(quality)
        .accounts({
          subscriber: subscriber.publicKey,
          dataProvider: dataProvider.publicKey,
          subscription: subscriptionPDA,
          qualityInfo: qualityPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          nftTokenAccount: providerTokenAccount,
        })
        .signers([subscriber])
        .rpc();

      // Verify cancellation
      const subscription = await program.account.subscription.fetch(subscriptionPDA);
      assert.equal(subscription.recipient, "", "Recipient not cleared");
      assert.ok(subscription.endTime.eq(new anchor.BN(0)), "End time not cleared");

      console.log("Subscription cancelled successfully");
    } catch (error) {
      console.error("Subscription cancellation failed:", error);
      throw error;
    }
  });

  // Test error conditions
  describe("Error cases", () => {
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

    it("Prevents invalid quality ratings", async () => {
      try {
        await program.methods
          .storeDataQuality(101) // Invalid quality > 100
          .accounts({
            subscriber: subscriber.publicKey,
            dataProvider: dataProvider.publicKey,
            qualityInfo: qualityPDA,
          })
          .signers([subscriber])
          .rpc();

        assert.fail("Should have thrown error for invalid quality");
      } catch (error: any) {
        assert.include(error.toString(), "QualityOutOfRange");
      }
    });
  });
});

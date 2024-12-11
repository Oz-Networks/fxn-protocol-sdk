declare module '@types/subscription_manager' {
    import { BN } from '@coral-xyz/anchor';
    import { PublicKey } from '@solana/web3.js';

    // Event Types
    export interface CollectorFeeUpdatedEvent {
        newCollectorFee: BN;
    }

    export interface FeePerDayUpdatedEvent {
        newFeePerDay: BN;
    }

    export interface QualityProvidedEvent {
        dataProvider: PublicKey;
        subscriber: PublicKey;
        quality: number;
    }

    export interface SubscriptionCancelledEvent {
        dataProvider: PublicKey;
        subscriber: PublicKey;
    }

    export interface SubscriptionCreatedEvent {
        dataProvider: PublicKey;
        subscriber: PublicKey;
        recipient: string;
        endTime: BN;
        timestamp: BN;
    }

    export interface SubscriptionEndedEvent {
        dataProvider: PublicKey;
        subscriber: PublicKey;
    }

    export interface SubscriptionRenewedEvent {
        dataProvider: PublicKey;
        subscriber: PublicKey;
        newRecipient: string;
        newEndTime: BN;
        timestamp: BN;
    }

    // Account Types
    export interface QualityRecord {
        provider: PublicKey;
        quality: number;
    }

    export interface QualityInfo {
        subscriber: PublicKey;
        quality: number;
        currentIndex: number;
        qualities: QualityRecord[];
    }

    export interface State {
        owner: PublicKey;
        nftProgramId: PublicKey;
        feePerDay: BN;
        collectorFee: BN;
    }

    export interface SubscribersList {
        subscribers: PublicKey[];
    }

    export interface Subscription {
        endTime: BN;
        recipient: string;
    }

    // Program Type
    export interface SubscriptionManager {
        address: string;
        metadata: {
            name: string;
            version: string;
            spec: string;
            description: string;
        };
        instructions: {
            cancelSubscription: (quality: number) => Promise<void>;
            endSubscription: (quality: number) => Promise<void>;
            getSubscribers: () => Promise<PublicKey[]>;
            initialize: () => Promise<void>;
            initializeQualityInfo: () => Promise<void>;
            renewSubscription: (
                newRecipient: string,
                newEndTime: BN,
                quality: number
            ) => Promise<void>;
            setCollectorFee: (newFee: BN) => Promise<void>;
            setFeePerDay: (newFee: BN) => Promise<void>;
            storeDataQuality: (quality: number) => Promise<void>;
            subscribe: (
                recipient: string,
                endTime: BN
            ) => Promise<void>;
        };
        accounts: {
            qualityInfo: QualityInfo;
            state: State;
            subscribersList: SubscribersList;
            subscription: Subscription;
        };
        errors: {
            periodTooShort: { code: 6000; msg: string };
            alreadySubscribed: { code: 6001; msg: string };
            insufficientPayment: { code: 6002; msg: string };
            invalidNftHolder: { code: 6003; msg: string };
            subscriptionNotFound: { code: 6004; msg: string };
            qualityOutOfRange: { code: 6005; msg: string };
            subscriptionAlreadyEnded: { code: 6006; msg: string };
            activeSubscription: { code: 6007; msg: string };
            notOwner: { code: 6008; msg: string };
        };
    }

    // Helper Types
    export interface ProgramAddresses {
        statePDA: PublicKey;
        qualityPDA: PublicKey;
        subscriptionPDA: PublicKey;
        subscribersListPDA: PublicKey;
    }

    export interface SubscriptionStatus {
        status: 'active' | 'expired' | 'expiring_soon';
        subscription: Subscription;
        subscriptionPDA: PublicKey;
        dataProvider: PublicKey;
    }

    export interface SubscriberDetails {
        subscriber: PublicKey;
        subscriptionPDA: PublicKey;
        subscription: Subscription;
        status: 'active' | 'expired' | 'expiring_soon';
    }

    export interface CreateSubscriptionParams {
        dataProvider: PublicKey;
        recipient: string;
        durationInDays: number;
        nftTokenAccount: PublicKey;
    }

    export interface RenewParams {
        dataProvider: PublicKey;
        newRecipient: string;
        newEndTime: number;
        qualityScore: number;
        nftTokenAccount: PublicKey;
    }

    export interface CancelParams {
        dataProvider: PublicKey;
        qualityScore: number;
        nftTokenAccount?: PublicKey;
    }
}

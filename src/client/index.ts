// index.ts
export {BaseClient} from './BaseClient';
export {CollectorFactoryClient} from './CollectorFactoryClient';
export {SubscriptionParams, SubscriptionManagerClient} from './SubscriptionManagerClient';
export {CollectorClient} from './CollectorClient';

// Also export types
export interface CollectorInfo {
    collectorAddress: string;
    collectorOwner: string;
    timestamp: number;
    validity: boolean;
}

export interface SubscriptionInfo {
    recipient: string;
    endTime: number;
}

import {ethers} from "ethers";

export const ERROR_SIGNATURES = {
    AlreadySubscribed: ethers.id("AlreadySubscribed()").slice(0, 10),
    SubscriptionPeriodTooShort: ethers.id("SubscriptionPeriodTooShort()").slice(0, 10),
    LessSubscriptionFeeSent: ethers.id("LessSubscriptionFeeSent()").slice(0, 10),
    SubscriptionNotFound: ethers.id("SubscriptionNotFound()").slice(0, 10),
};

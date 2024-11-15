import {ethers} from "ethers";

export const ERROR_SIGNATURES = {
    AlreadySubscribed: ethers.utils.id("AlreadySubscribed()").slice(0, 10),
    SubscriptionPeriodTooShort: ethers.utils.id("SubscriptionPeriodTooShort()").slice(0, 10),
    LessSubscriptionFeeSent: ethers.utils.id("LessSubscriptionFeeSent()").slice(0, 10),
    SubscriptionNotFound: ethers.utils.id("SubscriptionNotFound()").slice(0, 10),
};

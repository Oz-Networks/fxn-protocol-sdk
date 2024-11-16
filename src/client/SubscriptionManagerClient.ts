// SubscriptionManagerClient.ts
import { ethers } from "ethers";
import { BaseClient } from "./BaseClient.js";
import { abi as SubscriptionManagerAbi } from "../abi/SubscriptionManager.json";

import { ERROR_SIGNATURES } from "../types/errorSignatures.js";

export interface SubscriptionParams {
    dataProvider: string;
    recipient: string;
    endTime: number;
    value: ethers.BigNumber;
}

export class SubscriptionManagerClient extends BaseClient {
    private contract: ethers.Contract | null = null;

    async initialize(contractAddress: string, privateKey: string): Promise<void> {
        const signer = await this.getSignerFromPrivateKey(privateKey);
        this.contract = new ethers.Contract(contractAddress, SubscriptionManagerAbi, signer);
    }

    private ensureInitialized(): void {
        if (!this.contract) throw new Error("Client not initialized. Call initialize() first.");
    }

    async subscribe({dataProvider, recipient, endTime, value}: SubscriptionParams): Promise<void> {
        this.ensureInitialized();
        try {
            const gasEstimate: ethers.BigNumber = await this.contract!.estimateGas.subscribe(dataProvider, recipient, endTime, { value });
            const tx = await this.contract!.subscribe(
                dataProvider,
                recipient,
                endTime,
                {
                    value,
                    gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
                }
            );
            await tx.wait();
        } catch (error) {
            await this.handleContractError(error, ERROR_SIGNATURES);
        }
    }

    async calculateFees(duration: number): Promise<ethers.BigNumber> {
        this.ensureInitialized();
        if (duration < 1) throw new Error("Duration must be at least 1 day");

        const feePerDay = await this.contract!.feePerDay();
        const collectorFee = await this.contract!.collectorFee();

        return feePerDay.mul(duration).add(collectorFee);
    }

    async getSubscribers(dataProvider: string): Promise<string[]> {
        this.ensureInitialized();
        return await this.contract!.getSubscribers(dataProvider);
    }

    async getFeePerDay(): Promise<ethers.BigNumber> {
        this.ensureInitialized();
        return await this.contract!.feePerDay();
    }

    async getCollectorFee(): Promise<ethers.BigNumber> {
        this.ensureInitialized();
        return await this.contract!.collectorFee();
    }

    async getSubscription(dataProvider: string, subscriber: string): Promise<{recipient: string, endTime: number}> {
        this.ensureInitialized();
        return await this.contract!.subscription(dataProvider, subscriber);
    }
}

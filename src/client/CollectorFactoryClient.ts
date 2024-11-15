// CollectorFactoryClient.ts
import { ethers } from "ethers";
import { BaseClient } from "./BaseClient.js";
import { abi as CollectorFactoryAbi } from "../abi/CollectorFactory.json";

export class CollectorFactoryClient extends BaseClient {
    private contract: ethers.Contract | null = null;

    async initialize(contractAddress: string, privateKey: string): Promise<void> {
        const signer = await this.getSignerFromPrivateKey(privateKey);
        this.contract = new ethers.Contract(contractAddress, CollectorFactoryAbi, signer);
    }

    private ensureInitialized(): void {
        if (!this.contract) throw new Error("Client not initialized. Call initialize() first.");
    }

    async createCollector(
        nftAddress: string,
        feePerDay: bigint,
        collectorFee: bigint
    ): Promise<string> {
        this.ensureInitialized();
        const tx = await this.contract!.createCollector(nftAddress, feePerDay, collectorFee);
        const receipt = await tx.wait();
        const event = receipt.events?.find((e: any) => e.event === "CollectorCreated");
        return event?.args?.collector;
    }

    async listCollectorsByValidation(validation: boolean): Promise<any[]> {
        this.ensureInitialized();
        return await this.contract!.listCollectorsByValidation(validation);
    }

    async handleCollectorCreator(creatorAddress: string, active: boolean): Promise<void> {
        this.ensureInitialized();
        const tx = await this.contract!.handleCollectorCreator(creatorAddress, active);
        await tx.wait();
    }

    async handleReputationProvider(providerAddress: string, active: boolean): Promise<void> {
        this.ensureInitialized();
        const tx = await this.contract!.handleReputationProvider(providerAddress, active);
        await tx.wait();
    }

    async handleCollectorValidity(collectorAddress: string, validity: boolean): Promise<void> {
        this.ensureInitialized();
        const tx = await this.contract!.handleCollectorValidity(collectorAddress, validity);
        await tx.wait();
    }

    async getReputationScore(collector: string, dataProvider: string): Promise<number> {
        this.ensureInitialized();
        const score = await this.contract!.getReputationScore(collector, dataProvider);
        return score.toNumber();
    }

    async requestReputation(collector: string, dataProvider: string): Promise<void> {
        this.ensureInitialized();
        const tx = await this.contract!.requestReputation(collector, dataProvider);
        await tx.wait();
    }

    async storeReputationScore(
        collector: string,
        dataProvider: string,
        score: number
    ): Promise<void> {
        this.ensureInitialized();
        if (score < 0 || score > 100) throw new Error("Score must be between 0 and 100");
        const tx = await this.contract!.storeReputationScore(collector, dataProvider, score);
        await tx.wait();
    }
}

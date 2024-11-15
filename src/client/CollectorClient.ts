// CollectorClient.ts
import { ethers } from "ethers";
import { BaseClient } from "./BaseClient.js";
import { abi as NftAbi } from "../abi/Collector.json";

export class CollectorClient extends BaseClient {
    private contract: ethers.Contract | null = null;

    async initialize(contractAddress: string, privateKey: string): Promise<void> {
        const signer = await this.getSignerFromPrivateKey(privateKey);
        this.contract = new ethers.Contract(contractAddress, NftAbi, signer);
    }

    private ensureInitialized(): void {
        if (!this.contract) throw new Error("Client not initialized. Call initialize() first.");
    }

    async mint(recipientAddress: string): Promise<string> {
        this.ensureInitialized();
        const tx = await this.contract!['safeMint(address)'](recipientAddress);
        const receipt = await tx.wait();
        return receipt.transactionHash;
    }

    async balanceOf(address: string): Promise<number> {
        this.ensureInitialized();
        const balance = await this.contract!.balanceOf(address);
        return balance.toNumber();
    }

    async ownerOf(tokenId: number): Promise<string> {
        this.ensureInitialized();
        return await this.contract!.ownerOf(tokenId);
    }
}

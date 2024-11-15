// BaseClient.ts
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export class BaseClient {
    protected provider: JsonRpcProvider;

    constructor(rpcUrl: string) {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    protected async getSignerFromPrivateKey(privateKey: string): Promise<ethers.Wallet> {
        return new ethers.Wallet(privateKey, this.provider);
    }

    protected async handleContractError(error: any, errorSignatures: Record<string, string>): Promise<never> {
        if (error.data) {
            const errorSignature = error.data.slice(0, 10);
            const knownError = Object.entries(errorSignatures)
                .find(([, signature]) => signature === errorSignature);

            if (knownError) {
                console.error(`Error: ${knownError[0]}`);
                throw new Error(knownError[0]);
            }
        }
        console.error("Unknown contract error:", error);
        throw error;
    }
}

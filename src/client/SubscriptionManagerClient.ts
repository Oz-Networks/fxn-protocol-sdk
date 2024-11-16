import { ethers } from "ethers";
import { BaseClient } from "./BaseClient.js";
import { abi as SubscriptionManagerAbi } from "../abi/SubscriptionManager.json";
import { ERROR_SIGNATURES } from "../types/errorSignatures.js";

export interface SubscriptionParams {
    dataProvider: string;
    recipient: string;
    durationInDays: number;
    value: ethers.BigNumberish;
}

export class SubscriptionManagerClient extends BaseClient {
    private contract: ethers.Contract | null = null;

    async initialize(contractAddress: string, privateKey: string): Promise<void> {
        const signer = await this.getSignerFromPrivateKey(privateKey);
        this.contract = new ethers.Contract(
            contractAddress,
            SubscriptionManagerAbi,
            signer
        );
    }

    private ensureInitialized(): void {
        if (!this.contract) throw new Error("Client not initialized. Call initialize() first.");
    }

    async calculateFees(duration: number): Promise<ethers.BigNumberish> {
        this.ensureInitialized();
        if (duration < 1) throw new Error("Duration must be at least 1 day");

        const feePerDay = await this.contract!.feePerDay();
        const collectorFee = await this.contract!.collectorFee();

        const providerFee = BigInt(feePerDay) * BigInt(duration);
        const totalFee = providerFee + BigInt(collectorFee);

        console.log('=== Fee Calculation Details ===');
        console.log({
            duration,
            feePerDay: {
                raw: feePerDay.toString(),
                inEther: ethers.formatEther(feePerDay)
            },
            providerFee: {
                raw: providerFee.toString(),
                inEther: ethers.formatEther(providerFee)
            },
            collectorFee: {
                raw: collectorFee.toString(),
                inEther: ethers.formatEther(collectorFee)
            },
            totalFee: {
                raw: totalFee.toString(),
                inEther: ethers.formatEther(totalFee)
            }
        });

        return totalFee;
    }

    async subscribe({
                        dataProvider,
                        recipient,
                        durationInDays,
                        value
                    }: SubscriptionParams): Promise<void> {
        this.ensureInitialized();

        try {
            console.log('=== Subscribe Transaction Details ===');
            console.log({
                dataProvider,
                recipient,
                durationInDays,
                value: {
                    raw: value.toString(),
                    inEther: ethers.formatEther(value)
                }
            });

            // Call subscribe function directly with the duration
            const tx = await this.contract!.subscribe(
                dataProvider,
                recipient,
                durationInDays,
                {
                    value,
                    gasLimit: 500000  // Explicit gas limit
                }
            );

            // Wait for transaction with more detailed error handling
            const receipt = await tx.wait();

            if (!receipt.status) {
                throw new Error("Transaction failed during execution");
            }
        } catch (error: any) {
            console.error('Subscription Error:', error);

            // Check if it's a known error from the contract
            if (error.data) {
                const signature = error.data.slice(0, 10); // First 4 bytes of the error
                // @ts-ignore
                const knownError = ERROR_SIGNATURES[signature];
                if (knownError) {
                    throw new Error(`Contract error: ${knownError}`);
                }
            }

            throw error;
        }
    }
}

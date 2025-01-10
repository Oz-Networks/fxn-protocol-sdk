import { PublicKey } from '@solana/web3.js';

export class AddressValidator {
    static validate(address: string, label: string): void {
        try {
            new PublicKey(address);
        } catch (error) {
            throw new Error(`Invalid ${label}: ${address}`);
        }
    }
}
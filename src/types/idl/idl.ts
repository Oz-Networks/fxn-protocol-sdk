// idl.ts
import IDL_JSON from './subscription_manager.json';

// Helper function to convert account properties
function convertAccounts(accounts: any[]) {
    return accounts.map(account => ({
        name: account.name,
        isMut: account.writable ?? false,
        isSigner: account.signer ?? false,
        // Preserve PDA info if it exists
        pda: account.pda,
        // Preserve address if it exists
        address: account.address
    }));
}

// Transform instructions to match Anchor's expected format
const instructions = IDL_JSON.instructions.map(instruction => ({
    ...instruction,
    accounts: convertAccounts(instruction.accounts)
}));

// Create the properly formatted IDL
export const IDL = {
    version: IDL_JSON.metadata.version,
    name: IDL_JSON.metadata.name,
    instructions,
    accounts: IDL_JSON.accounts,
    events: IDL_JSON.events,
    errors: IDL_JSON.errors,
    types: IDL_JSON.types,
};

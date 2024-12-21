"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
// idl.ts
const subscription_manager_json_1 = __importDefault(require("./subscription_manager.json"));
// Helper function to convert account properties
function convertAccounts(accounts) {
    return accounts.map(account => {
        var _a, _b;
        return ({
            name: account.name,
            isMut: (_a = account.writable) !== null && _a !== void 0 ? _a : false,
            isSigner: (_b = account.signer) !== null && _b !== void 0 ? _b : false,
            // Preserve PDA info if it exists
            pda: account.pda,
            // Preserve address if it exists
            address: account.address
        });
    });
}
// Transform instructions to match Anchor's expected format
const instructions = subscription_manager_json_1.default.instructions.map(instruction => (Object.assign(Object.assign({}, instruction), { accounts: convertAccounts(instruction.accounts) })));
// Create the properly formatted IDL
exports.IDL = {
    version: subscription_manager_json_1.default.metadata.version,
    name: subscription_manager_json_1.default.metadata.name,
    instructions,
    accounts: subscription_manager_json_1.default.accounts,
    events: subscription_manager_json_1.default.events,
    errors: subscription_manager_json_1.default.errors,
    types: subscription_manager_json_1.default.types,
};

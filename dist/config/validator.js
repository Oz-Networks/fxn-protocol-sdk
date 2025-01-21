"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressValidator = void 0;
const web3_js_1 = require("@solana/web3.js");
class AddressValidator {
    static validate(address, label) {
        try {
            new web3_js_1.PublicKey(address);
        }
        catch (error) {
            throw new Error(`Invalid ${label}: ${address}`);
        }
    }
}
exports.AddressValidator = AddressValidator;

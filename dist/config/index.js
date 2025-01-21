"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config/index.ts
const manager_1 = require("./manager");
// Create config with fallback initialization
let config;
try {
    exports.config = config = (0, manager_1.getConfig)().getNetworkConfig();
}
catch (_a) {
    // If not initialized, initialize with defaults
    exports.config = config = (0, manager_1.initializeConfig)({
        network: 'devnet',
        timeout: 30000,
        commitment: 'confirmed'
    }).getNetworkConfig();
}
// Export everything else
__exportStar(require("./types"), exports);
__exportStar(require("./networks"), exports);
__exportStar(require("./validator"), exports);
__exportStar(require("./manager"), exports);

const crypto = require('crypto');

/**
 * Generates a secure, human-readable ID based on the entity type.
 * * Formats:
 * - USER: USR-[YYMM]-[4_HEX] (e.g., USR-2412-A9F1)
 * - SUBMISSION: SUB-[TIMESTAMP]-[3_HEX] (e.g., SUB-1709999999-F1A)
 * - CONTRACT: CTR-[YYYYMMDD]-[TIMESTAMP_MICRO]-[3_HEX] (e.g., CTR-20241228-123456-ABC)
 * - TICKET: REQ-[YYYYMM]-[SEQUENCE_HEX]
 */

const generateRandomHex = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};

const generateId = (type) => {
    const now = new Date();
    const yearShort = now.getFullYear().toString().substr(-2);
    const yearFull = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const timestamp = Math.floor(Date.now() / 1000);

    switch (type) {
        case 'USER':
            return `USR-${yearShort}${month}-${generateRandomHex(4)}`;
        
        case 'SUBMISSION':
            return `SUB-${timestamp}-${generateRandomHex(3)}`;
            
        case 'CONTRACT':
            // High precision ID for legal documents
            return `CTR-${yearFull}${month}${day}-${timestamp}-${generateRandomHex(3)}`;
            
        case 'TICKET':
            return `REQ-${yearFull}${month}-${generateRandomHex(5)}`;
            
        case 'TRANSACTION':
            return `TXN-${timestamp}-${generateRandomHex(4)}`;

        default:
            return `GEN-${timestamp}-${generateRandomHex(4)}`;
    }
};

module.exports = { generateId };
const crypto = require('crypto');

/**
 * Generates a cryptographically secure random hexadecimal string.
 * @param {number} length - The length of the resulting string.
 * @returns {string} Uppercase hexadecimal string.
 */
const generateSecureHex = (length) => {
    // Calculate required bytes (1 byte = 2 hex chars)
    const byteLength = Math.ceil(length / 2);
    return crypto.randomBytes(byteLength)
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};

/**
 * ID Generation Configuration
 * Centralized format definitions for easier maintenance.
 */
const ID_PREFIXES = {
    USER: 'USR',
    SUBMISSION: 'SUB',
    CONTRACT: 'CTR',
    TICKET: 'REQ',
    TRANSACTION: 'TXN',
    DEFAULT: 'GEN'
};

/**
 * Generates a unique, human-readable identifier for business entities.
 * * Formats:
 * - USER:        USR-[YYMM]-[4_HEX]           (e.g., USR-2412-A9F1)
 * - SUBMISSION:  SUB-[TIMESTAMP]-[3_HEX]      (e.g., SUB-1709999999-F1A)
 * - CONTRACT:    CTR-[YYYYMMDD]-[TIME]-[3_HEX](e.g., CTR-20241228-123456-ABC)
 * - TICKET:      REQ-[YYYYMM]-[5_HEX]         (e.g., REQ-202412-A9F1B)
 * - TRANSACTION: TXN-[TIMESTAMP]-[4_HEX]      (e.g., TXN-1709999999-ABCD)
 * * @param {string} entityType - The type of entity (USER, CONTRACT, etc.)
 * @returns {string} The formatted ID.
 */
const generateId = (entityType) => {
    const now = new Date();
    const type = entityType ? entityType.toUpperCase() : 'DEFAULT';

    // Time components
    const timestamp = Math.floor(Date.now() / 1000);
    const yearFull = now.getFullYear();
    const yearShort = yearFull.toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    switch (type) {
        case 'USER':
            return `${ID_PREFIXES.USER}-${yearShort}${month}-${generateSecureHex(4)}`;

        case 'SUBMISSION':
            return `${ID_PREFIXES.SUBMISSION}-${timestamp}-${generateSecureHex(3)}`;

        case 'CONTRACT':
            // High precision ID for legal binding documents
            const timePart = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
            return `${ID_PREFIXES.CONTRACT}-${yearFull}${month}${day}-${timePart}-${generateSecureHex(3)}`;

        case 'TICKET':
            return `${ID_PREFIXES.TICKET}-${yearFull}${month}-${generateSecureHex(5)}`;

        case 'TRANSACTION':
            return `${ID_PREFIXES.TRANSACTION}-${timestamp}-${generateSecureHex(4)}`;

        default:
            return `${ID_PREFIXES.DEFAULT}-${timestamp}-${generateSecureHex(4)}`;
    }
};

module.exports = { generateId };
/**
 * Math Utility Module
 * Provides standardized methods for currency calculations and percentage normalization.
 * Follows the "Defensive Percent Normalization" protocol.
 */

/**
 * Normalizes a percentage input into a decimal factor.
 * Protocol: 
 * - Values > 1.0 are treated as integer percentages (e.g., 15 becomes 0.15).
 * - Values <= 1.0 are treated as decimal factors (e.g., 0.15 remains 0.15).
 * * @param {number} value - The percentage value to normalize.
 * @returns {number} The normalized decimal factor.
 */
const normalizePercent = (value) => {
    if (!value || typeof value !== 'number') return 0;
    // Threshold check: Assume any value > 1.0 is an integer percentage representation.
    return (value > 1.0) ? value / 100 : value;
};

/**
 * Calculates a portion of an amount based on a percentage.
 * Handles rounding to the nearest integer to maintain currency integrity (IDR).
 * * @param {number} amount - The base amount.
 * @param {number} percent - The percentage (either integer or decimal).
 * @returns {number} The calculated portion rounded to nearest integer.
 */
const calculateAmount = (amount, percent) => {
    const factor = normalizePercent(percent);
    return Math.round(amount * factor);
};

module.exports = { normalizePercent, calculateAmount };
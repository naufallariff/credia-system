import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up the DOM after each test case
// This ensures tests do not interfere with each other
afterEach(() => {
    cleanup();
});
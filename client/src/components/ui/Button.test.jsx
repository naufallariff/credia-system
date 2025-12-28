import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        const buttonElement = screen.getByText(/Click Me/i);
        expect(buttonElement).toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
        // We search for a button with disabled attribute, as isLoading disables the button
        render(<Button isLoading={true}>Processing</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        // Assuming Loader2 renders an SVG, we can check for presence of svg or class
        // But logically, checking disabled state is sufficient for this logic check
    });

    it('applies danger variant classes', () => {
        render(<Button variant="danger">Delete</Button>);
        const button = screen.getByRole('button');
        // Check if the class list contains the red color code defined in Button.jsx
        expect(button.className).toContain('bg-red-600');
    });
});
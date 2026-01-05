import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility untuk menggabungkan class tailwind secara kondisional dan aman.
 * Standar industri untuk Shadcn/UI.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
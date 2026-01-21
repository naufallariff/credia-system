import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const PaginationControls = ({
    currentPage,
    totalPages,
    hasPrev,
    hasNext,
    onPageChange,
    isLoading
}) => {
    return (
        <div className="flex items-center justify-between px-4 py-4 bg-card">
            {/* Info Halaman (Kiri) */}
            <div className="text-sm text-muted-foreground">
                Showing page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            {/* Tombol Navigasi (Kanan) */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrev || isLoading}
                    className="h-8 w-8 p-0 lg:w-auto lg:px-4 lg:h-9 bg-background hover:bg-accent border-border"
                >
                    <ChevronLeft className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Previous</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext || isLoading}
                    className="h-8 w-8 p-0 lg:w-auto lg:px-4 lg:h-9 bg-background hover:bg-accent border-border"
                >
                    <span className="hidden lg:inline">Next</span>
                    <ChevronRight className="h-4 w-4 lg:ml-2" />
                </Button>
            </div>
        </div>
    );
};
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNext,
    hasPrev,
    isLoading
}) => {
    return (
        <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
                <span className="font-medium text-slate-900">{totalPages || 1}</span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrev || isLoading}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext || isLoading}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
                </Button>
            </div>
        </div>
    );
};
import { useSession } from '@/shared/model/use-session';
import { useClientPortfolio } from '@/features/client/use-client-portfolio';
import { ActiveLoanCard } from '@/widgets/client/active-loan-card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatRupiah } from '@/entities/contract/model';
import { Badge } from '@/shared/ui/badge';

export const ClientDashboardPage = () => {
    const { user } = useSession();
    const { data: portfolio, isLoading } = useClientPortfolio();

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* 1. Personal Greeting */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Hello, {user?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to your client portal. Here is the summary of your financing.
                </p>
            </div>

            {/* 2. Main Hero Card */}
            <section>
                {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                ) : (
                    <ActiveLoanCard
                        contract={portfolio?.activeContract}
                        summary={portfolio?.summary}
                    />
                )}
            </section>

            {/* 3. History List */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Contract History</h2>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full bg-muted rounded-xl" />
                        <Skeleton className="h-20 w-full bg-muted rounded-xl" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {portfolio?.contracts?.length > 0 ? (
                            portfolio.contracts.map(contract => (
                                <div
                                    key={contract._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-foreground text-lg">{contract.contract_no}</p>
                                            {contract.status === 'ACTIVE' && (
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Principal: <span className="font-mono text-foreground">{formatRupiah(contract.principal_amount)}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-muted-foreground uppercase">Status</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${contract.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                }`}
                                        >
                                            {contract.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-card border border-dashed border-border rounded-xl text-muted-foreground">
                                No contract history found.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};
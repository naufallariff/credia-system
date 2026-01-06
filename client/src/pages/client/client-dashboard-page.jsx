import { useSession } from '@/shared/model/use-session';
import { useClientPortfolio } from '@/features/client/use-client-portfolio';
import { ActiveLoanCard } from '@/widgets/client/active-loan-card';
import { Skeleton } from '@/shared/ui/skeleton';

export const ClientDashboardPage = () => {
    const { user } = useSession();
    const { data: portfolio, isLoading } = useClientPortfolio();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* 1. Personal Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Hello, {user?.name}
                </h1>
                <p className="text-slate-500">
                    Welcome to your client portal. Here is the summary of your financing.
                </p>
            </div>

            {/* 2. Main Hero Card */}
            <section>
                {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : (
                    <ActiveLoanCard
                        contract={portfolio?.activeContract}
                        summary={portfolio?.summary}
                    />
                )}
            </section>

            {/* 3. History List (Simple) */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contract History</h2>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {portfolio?.contracts?.length > 0 ? (
                            portfolio.contracts.map(contract => (
                                <div
                                    key={contract._id}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">{contract.contract_no}</p>
                                        <p className="text-xs text-slate-500">{formatRupiah(contract.principal_amount)} • {contract.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {contract.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No history found.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};
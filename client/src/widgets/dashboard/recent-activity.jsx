import { Activity, FileText, User, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export const RecentActivity = ({ activities = [] }) => {
    // Jika data kosong, tampilkan simulasi agar tidak jelek
    const displayData = activities.length > 0 ? activities : [];

    return (
        <Card className="h-[450px] flex flex-col bg-card border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    Recent Activity
                </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-1">
                <CardContent className="p-0">
                    {displayData.length > 0 ? (
                        <div className="flex flex-col">
                            {displayData.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    className="flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <div className={`mt-1 p-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                                            item.status === 'PENDING_ACTIVATION' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {item.status === 'ACTIVE' ? <CheckCircle size={14} /> : <FileText size={14} />}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground leading-none">
                                            {item.status === 'PENDING_ACTIVATION' ? 'New Application' : 'Contract Activated'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground/80">{item.contract_no}</span>
                                            {' - '}
                                            {item.client?.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground pt-1">
                                            {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <Activity className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No recent activity recorded.</p>
                        </div>
                    )}
                </CardContent>
            </ScrollArea>
        </Card>
    );
};
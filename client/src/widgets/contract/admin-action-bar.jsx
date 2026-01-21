import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useSession } from '@/shared/model/use-session';
import { useContractActions } from '@/features/contract/use-contract-actions';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Textarea } from '@/shared/ui/textarea';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

export const AdminActionBar = ({ contractId, status }) => {
    const { user } = useSession();
    const { mutate, isPending } = useContractActions();
    const [rejectReason, setRejectReason] = useState('');

    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user?.role);
    const isPendingActivation = status === 'PENDING_ACTIVATION';

    if (!isAdmin || !isPendingActivation) return null;

    const handleApprove = () => {
        mutate({ id: contractId, action: 'APPROVE' });
    };

    const handleReject = () => {
        mutate({ id: contractId, action: 'REJECT', reason: rejectReason });
    };

    return (
        <Card className="border-l-4 border-l-amber-500 bg-amber-500/10 shadow-md mb-6 border-border">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Approval Required</h3>
                        <p className="text-sm text-muted-foreground">
                            This contract is waiting for activation. Please review the details carefully.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Reject Button */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive bg-background">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reject Contract Application?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. The contract will be marked as VOID.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-2">
                                <Textarea
                                    placeholder="Enter reason for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleReject}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={!rejectReason}
                                >
                                    Confirm Reject
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Approve Button */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white">
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve & Activate
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Activate Contract?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will generate the official payment schedule and allow the client to start payments.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Yes, Activate
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
};
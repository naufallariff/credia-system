import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
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

    const isPendingActivation = status === 'PENDING_ACTIVATION';

    // 1. Guard Clause: Jika status bukan pending, tidak perlu render apa-apa
    if (!isPendingActivation) return null;

    // --- RBAC LOGIC UPDATE ---
    // Hanya Role 'ADMIN' yang boleh eksekusi. 
    // Superadmin dan Staff hanya View Only.
    const canApprove = user?.role === 'ADMIN';
    const isSuperAdmin = user?.role === 'SUPERADMIN';

    // 2. VIEW ONLY MODE (Staff & Superadmin)
    if (!canApprove) {
        return (
            <Card className="border-l-4 border-l-blue-500 bg-blue-500/10 shadow-sm mb-6 border-border">
                <CardContent className="p-4 flex items-center gap-3">
                    {isSuperAdmin ? (
                        <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}

                    <div>
                        <h3 className="font-bold text-foreground">
                            {isSuperAdmin ? "Superadmin Access (View Only)" : "Waiting for Approval"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isSuperAdmin
                                ? "Operational approvals are restricted to Finance Admins for audit compliance."
                                : "This application is currently being reviewed by the Finance team."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 3. ACTION MODE (Admin Only)
    const handleApprove = () => mutate({ id: contractId, action: 'APPROVE' });
    const handleReject = () => mutate({ id: contractId, action: 'REJECT', reason: rejectReason });

    return (
        <Card className="border-l-4 border-l-amber-500 bg-amber-500/10 shadow-md mb-6 border-border">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Approval Action Required</h3>
                        <p className="text-sm text-muted-foreground">
                            Please validate the client's creditworthiness before activation.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* REJECT BUTTON */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive bg-background">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action is irreversible. The contract will be marked as VOID.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-2">
                                <Textarea
                                    placeholder="Reason for rejection (Required)..."
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
                                    disabled={!rejectReason || isPending}
                                >
                                    Confirm Reject
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* APPROVE BUTTON */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white">
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve & Activate
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Authorize Disbursement?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    By approving, you confirm that all KYC checks have been passed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleApprove}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isPending}
                                >
                                    {isPending ? 'Processing...' : 'Yes, Activate Contract'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
};
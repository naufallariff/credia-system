import { useState } from 'react'; // Pastikan useState diimport
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';

// --- PERBAIKAN IMPORT (FIXED SECTION) ---
// 1. Import Schema dari file schema
import { CreateUserSchema } from '@/features/user/user-schema';
// 2. Import Hook dari file use-users (BUKAN dari schema)
import { useCreateUser } from '@/features/user/use-users';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";

export const CreateUserDialog = () => {
    const [open, setOpen] = useState(false);

    // Gunakan hook yang sudah diimport dengan benar
    const { mutate, isPending } = useCreateUser();

    const form = useForm({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: { role: 'CLIENT', name: '', username: '', email: '', password: '' }
    });

    const onSubmit = (data) => {
        mutate(data, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            {/* ... Sisa kode ke bawah TETAP SAMA ... */}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>Add a new staff member or client to the system.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

                    {/* Name & Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...form.register('name')} placeholder="John Doe" />
                            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select onValueChange={(val) => form.setValue('role', val)} defaultValue="CLIENT">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLIENT">Client (Borrower)</SelectItem>
                                    <SelectItem value="STAFF">Staff (Sales)</SelectItem>
                                    <SelectItem value="ADMIN">Admin (Finance)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" {...form.register('email')} placeholder="john@example.com" />
                        {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input {...form.register('username')} placeholder="john.doe" />
                            {form.formState.errors.username && <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" {...form.register('password')} placeholder="••••••" />
                            {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
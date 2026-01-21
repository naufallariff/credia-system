import { Sliders } from 'lucide-react';
import { SettingsForm } from '@/widgets/config/settings-form';

export const SettingsPage = () => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/10">
                    <Sliders className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">System Configuration</h1>
                    <p className="text-muted-foreground">Manage global business rules and application variables.</p>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingsForm />
            </div>
        </div>
    );
};
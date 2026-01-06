import { Sliders } from 'lucide-react';
import { SettingsForm } from '@/widgets/config/settings-form';

export const SettingsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                    <Sliders className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-slate-500 text-sm">Manage global business rules and application variables.</p>
                </div>
            </div>

            <SettingsForm />
        </div>
    );
};
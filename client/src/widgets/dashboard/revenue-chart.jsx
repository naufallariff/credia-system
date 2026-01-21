import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { BarChart3 } from 'lucide-react';
import { formatRupiah } from '@/entities/contract/model';

// Dummy Data Generator (Simulasi data 6 bulan terakhir)
// Nanti ini bisa diganti dengan data real dari API
const data = [
    { name: 'Jan', total: 15000000 },
    { name: 'Feb', total: 28000000 },
    { name: 'Mar', total: 45000000 },
    { name: 'Apr', total: 32000000 },
    { name: 'May', total: 58000000 },
    { name: 'Jun', total: 85000000 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <p className="text-sm text-primary font-mono">
                    {formatRupiah(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export const RevenueChart = () => {
    return (
        <Card className="col-span-2 h-[400px] flex flex-col bg-card border-border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Portfolio Growth
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Total loan value disbursed over the last 6 months.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 pb-2">
                <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Rp ${value / 1000000}M`}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
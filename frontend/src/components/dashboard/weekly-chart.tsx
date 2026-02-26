'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { WeeklyDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyChartProps {
    data: WeeklyDataPoint[];
    loading?: boolean;
}

// Recharts passes these props to custom tooltip components
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: WeeklyDataPoint }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const { completed, total, rate } = payload[0].payload;

    return (
        <div
            className="rounded-xl px-3.5 py-3 shadow-2xl glass border border-foreground/[0.05]"
        >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <div className="flex items-center justify-between gap-6">
                <p className="text-sm font-semibold text-foreground">
                    {completed} / {total} habits
                </p>
                <p className="text-sm font-bold text-primary">
                    {rate}%
                </p>
            </div>
        </div>
    );
}

export default function WeeklyChart({ data, loading }: WeeklyChartProps) {
    if (loading) {
        return <Skeleton className="h-64 rounded-xl" />;
    }

    return (
        <div aria-label="Weekly completion chart" role="img" className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="0"
                        stroke="currentColor"
                        className="text-foreground/[0.03]"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                        className="text-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                        className="text-muted-foreground/80"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                        dx={-5}
                    />
                    <Tooltip
                        content={(props) => (
                            <CustomTooltip
                                active={props.active}
                                payload={props.payload as Array<{ payload: WeeklyDataPoint }> | undefined}
                                label={props.label as string | undefined}
                            />
                        )}
                        cursor={{ stroke: 'currentColor', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fill="url(#colorRate)"
                        animationDuration={1500}
                        dot={{ fill: 'var(--primary)', r: 0 }}
                        activeDot={{
                            r: 5,
                            fill: 'var(--primary)',
                            stroke: '#fff',
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

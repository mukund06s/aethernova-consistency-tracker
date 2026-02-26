import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn('skeleton', className)}
            style={style}
            role="status"
            aria-label="Loading..."
        />
    );
}

export function HabitCardSkeleton() {
    return (
        <div
            className="rounded-xl p-4 mb-3"
            style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
            role="status"
            aria-label="Loading habit..."
        >
            <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 rounded mb-2" style={{ width: '60%' }} />
                    <Skeleton className="h-3 rounded" style={{ width: '40%' }} />
                </div>
                <Skeleton className="w-20 h-8 rounded-lg" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div
            className="rounded-xl p-5"
            style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
            role="status"
            aria-label="Loading stat..."
        >
            <Skeleton className="h-4 rounded mb-3" style={{ width: '40%' }} />
            <Skeleton className="h-8 rounded mb-2" style={{ width: '60%' }} />
            <Skeleton className="h-3 rounded" style={{ width: '80%' }} />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div aria-label="Loading dashboard..." aria-busy="true">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
            </div>
            <div
                className="rounded-xl p-5 mb-6"
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
            >
                <Skeleton className="h-4 rounded mb-2" style={{ width: '80%' }} />
                <Skeleton className="h-3 rounded" style={{ width: '30%' }} />
            </div>
            <div
                className="rounded-xl p-5 mb-6"
                style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
            >
                <Skeleton className="h-5 rounded mb-4" style={{ width: '40%' }} />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
    );
}

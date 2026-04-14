import { OrderStatus } from '../../types';

const config: Record<OrderStatus, { bg: string; color: string; label: string }> = {
    NEW:               { bg: '#dbeafe', color: '#1d4ed8', label: 'New' },
    ACCEPTED:          { bg: '#ede9fe', color: '#6d28d9', label: 'Accepted' },
    IN_REPAIR:         { bg: '#ffedd5', color: '#c2410c', label: 'In Repair' },
    WAITING_FOR_PARTS: { bg: '#fef9c3', color: '#a16207', label: 'Waiting for Parts' },
    REPAIRED:          { bg: '#ccfbf1', color: '#0f766e', label: 'Repaired' },
    DELIVERING:        { bg: '#e0e7ff', color: '#4338ca', label: 'Delivering' },
    COMPLETED:         { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
    CANCELLED:         { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const { bg, color, label } = config[status] ?? { bg: '#f1f5f9', color: '#475569', label: status };
    return (
        <span style={{
            backgroundColor: bg,
            color,
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
};

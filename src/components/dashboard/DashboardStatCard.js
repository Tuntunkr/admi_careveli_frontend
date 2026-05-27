import React, { useCallback, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getAdminStats } from '../../helper/admin_helper';

function DashboardStatCard({ label, value, icon, iconBg, iconColor, subtext, accentColor = '#3B82F6' }) {
    return (
        <Card
            className="border-0 shadow-sm dashboard-stat-card h-100"
            style={{ borderLeft: `4px solid ${accentColor}` }}
        >
            <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="flex-grow-1 min-w-0">
                        <div className="text-secondary small mb-1">{label}</div>
                        <h4 className="mb-0 fw-bold text-truncate">{value}</h4>
                        {subtext && <div className="text-secondary small mt-1">{subtext}</div>}
                    </div>
                    <div
                        className="dashboard-stat-card__icon"
                        style={{ backgroundColor: iconBg, color: iconColor }}
                    >
                        <i className={icon}></i>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export default DashboardStatCard;

/** Bearer token used by dashboard + admin helpers */
export function getAdminDashboardToken(userState) {
    const nested = userState?.user || userState;
    return nested?.token || localStorage.getItem('adminToken') || '';
}

/**
 * GET /api/user/admin/stats — normalizes nested `data.overview` when present.
 * @returns {null | Record<string, number>}
 */
export function parseAdminOverviewFromResponse(res) {
    if (!res || res.success === false) return null;
    const overview = res?.data?.overview || res?.overview;
    if (!overview || typeof overview !== 'object') return null;
    return overview;
}

/**
 * Overlay live overview counts onto existing dashboard stats (mock or API).
 */
export function mergeAdminOverviewIntoStats(prevStats, overview) {
    if (!overview || typeof overview !== 'object') return prevStats;

    const base = prevStats && typeof prevStats === 'object' ? { ...prevStats } : {};
    const summary = { ...(base.summary || {}) };

    if (overview.totalUsers != null) summary.totalUsers = Number(overview.totalUsers) || summary.totalUsers;
    if (overview.totalOrders != null) summary.totalOrders = Number(overview.totalOrders) || summary.totalOrders;
    if (overview.totalProducts != null) summary.totalProducts = Number(overview.totalProducts) || summary.totalProducts;
    if (overview.activeProducts != null) summary.activeProducts = Number(overview.activeProducts);

    const userActivity = { ...(base.userActivity || {}) };
    if (overview.activeUsers != null) userActivity.active = Number(overview.activeUsers) || userActivity.active;
    if (
        overview.totalUsers != null &&
        overview.activeUsers != null
    ) {
        const inactive = Number(overview.totalUsers) - Number(overview.activeUsers);
        userActivity.inactive = Math.max(0, inactive);
    }

    return {
        ...base,
        summary,
        userActivity,
    };
}

/**
 * Loads admin overview from backend (requires Bearer token).
 */
export async function fetchAdminOverviewStats(token) {
    if (!token) {
        return { ok: false, message: 'Not Authorized - No Token Provided', overview: null };
    }
    try {
        const res = await getAdminStats(token);
        const overview = parseAdminOverviewFromResponse(res);
        if (!overview && res?.success !== true) {
            return {
                ok: false,
                message: res?.message || res?.error || 'Failed to load admin stats',
                overview: null,
            };
        }
        return { ok: true, overview, message: null, raw: res };
    } catch (e) {
        console.error('[fetchAdminOverviewStats]', e);
        return { ok: false, message: e?.message || 'Network error', overview: null };
    }
}

/**
 * Hook for Admin Dashboard — fetches `/user/admin/stats` once token is present.
 */
export function useAdminOverviewStats() {
    const userState = useSelector((state) => state.user);
    const token = getAdminDashboardToken(userState);
    const [loading, setLoading] = useState(Boolean(token));
    const [error, setError] = useState(null);
    const [overview, setOverview] = useState(null);

    const refetch = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError(null);
            setOverview(null);
            return;
        }
        setLoading(true);
        setError(null);
        const result = await fetchAdminOverviewStats(token);
        setLoading(false);
        if (!result.ok) {
            setError(result.message || 'Failed to fetch stats');
            setOverview(null);
            return;
        }
        setOverview(result.overview);
    }, [token]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { overview, loading, error, refetch, token };
}

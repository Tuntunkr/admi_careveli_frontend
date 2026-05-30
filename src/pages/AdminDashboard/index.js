import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Table, Badge, ProgressBar, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../layouts/Footer";
import Header from "../../layouts/Header";
import { toast } from 'react-toastify';
import { getDashboardSummary, getChartAnalytics } from '../../helper/analytics_helper';
import { getAllOrders } from '../../helper/order_helper';
import { formatCurrency as formatOrderCurrency, getStatusBadgeColor } from '../../helper/order_helper';
import AnalyticsDashboardSkeleton from '../../components/AnalyticsDashboardSkeleton';
import DashboardStatCard, {
    mergeAdminOverviewIntoStats,
    useAdminOverviewStats,
    getAdminDashboardToken,
} from '../../components/dashboard/DashboardStatCard';
import {
    buildDashboardMetrics,
    TIME_FILTER_LABELS,
    FILTER_TO_CHART_INTERVAL,
    buildDashboardPayloadFromApis,
} from '../../Utils/analyticsDashboard';
import '../../assets/css/admin-dashboard.css';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = {
    Paid: '#10B981',
    Completed: '#10B981',
    Pending: '#F59E0B',
    Failed: '#EF4444',
    Refunded: '#6B7280',
    Delivered: '#10B981',
    Shipped: '#3B82F6',
    Processing: '#06B6D4',
    Cancelled: '#EF4444',
    Active: '#10B981',
    Inactive: '#F59E0B',
};

const QUICK_ACTIONS = [
    { label: 'Products', icon: 'ri-shopping-bag-line', path: '/product', color: '#2563EB', bg: '#DBEAFE', countKey: 'totalProducts' },
    { label: 'Affiliate Users', icon: 'ri-user-star-line', path: '/affiliate-users', color: '#9333EA', bg: '#F3E8FF' },
    { label: 'Marketing Links', icon: 'ri-links-line', path: '/marketing-links', color: '#0D9488', bg: '#CCFBF1' },
    { label: 'Payment History', icon: 'ri-money-dollar-circle-line', path: '/payment-history', color: '#16A34A', bg: '#DCFCE7' },
];

const KPI_ACCENTS = ['#16A34A', '#EA580C', '#2563EB', '#9333EA'];

const EmptyTableRow = ({ colSpan, message }) => (
    <tr>
        <td colSpan={colSpan} className="text-center text-secondary small py-4">
            {message}
        </td>
    </tr>
);

export default function AdminDashboard() {
    const user = useSelector(state => state.user);
    const { overview, loading: overviewLoading, error: overviewError } = useAdminOverviewStats();
    const adminName = user?.name || user?.user?.name || 'Admin';
    const currentSkin = localStorage.getItem('skin-mode') ? 'dark' : '';
    const [skin, setSkin] = useState(currentSkin);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [timeFilter, setTimeFilter] = useState('last30days');
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const switchSkin = (mode) => {
        if (mode === 'dark') {
            document.querySelectorAll('.btn-white').forEach(btn => {
                btn.classList.add('btn-outline-primary');
                btn.classList.remove('btn-white');
            });
        } else {
            document.querySelectorAll('.btn-outline-primary').forEach(btn => {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-white');
            });
        }
    };

    useEffect(() => {
        switchSkin(skin);
    }, [skin]);

    /** Overlay GET /user/admin/stats `overview` on mock / analytics payload */
    const displayStats = useMemo(
        () => (overview ? mergeAdminOverviewIntoStats(stats || {}, overview) : stats),
        [stats, overview]
    );

    const metrics = useMemo(() => buildDashboardMetrics(displayStats || {}), [displayStats]);

    const orderStatusMax = useMemo(() => {
        const list = displayStats?.orderStatus || [];
        return Math.max(...list.map(item => item.count || 0), 1);
    }, [displayStats]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const fetchAnalytics = async (filter = timeFilter, silent = false) => {
        if (!silent) setLoading(true);
        setFetchError(null);

        const interval = FILTER_TO_CHART_INTERVAL[filter] || 'monthly';
        const token = getAdminDashboardToken(user);

        try {
            const [summaryResult, chartsResult, ordersResult] = await Promise.allSettled([
                getDashboardSummary(filter),
                getChartAnalytics(interval, filter),
                token
                    ? getAllOrders(token, { page: 1, limit: 5, sortBy: 'date', order: 'desc' })
                    : Promise.resolve(null),
            ]);

            if (summaryResult.status === 'rejected') {
                throw summaryResult.reason;
            }

            const summaryRes = summaryResult.value;
            const chartsRes =
                chartsResult.status === 'fulfilled' ? chartsResult.value : null;
            const ordersRes =
                ordersResult.status === 'fulfilled' ? ordersResult.value : null;

            if (chartsResult.status === 'rejected') {
                toast.warn(
                    chartsResult.reason?.message || 'Charts analytics could not be loaded'
                );
            } else if (chartsRes?.success === false) {
                toast.warn(chartsRes?.message || 'Charts analytics could not be loaded');
            }

            const payload = buildDashboardPayloadFromApis(summaryRes, chartsRes);

            if (!payload && summaryRes?.success === false) {
                throw new Error(summaryRes?.message || 'Failed to load dashboard summary');
            }

            if (!payload) {
                throw new Error('Invalid analytics summary response');
            }

            setStats(payload.stats);

            let orders = payload.recentOrders || [];
            if (ordersRes?.success) {
                const fromApi =
                    ordersRes.orders ||
                    ordersRes.data?.orders ||
                    (Array.isArray(ordersRes.data) ? ordersRes.data : []);
                if (fromApi.length) orders = fromApi.slice(0, 5);
            }
            setRecentOrders(orders);

            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error loading dashboard:', error);
            const message = error?.message || 'Failed to load analytics';
            setFetchError(message);
            toast.error(message);
            setStats(null);
            setRecentOrders([]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeFilter]);

    // useEffect(() => {
    //     const token = user?.token || localStorage.getItem('adminToken');
    //     if (!token) return undefined;
    //     const intervalId = setInterval(() => {
    //         if (!loading) fetchAnalytics(timeFilter, chartInterval, true);
    //     }, 60000);
    //     return () => clearInterval(intervalId);
    // }, [loading, timeFilter, chartInterval, user?.token]);

    const renderPieSection = (title, data, valueKey = 'count', labelKey = 'status', amountFormatter) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <h6 className="mb-4 fw-bold">{title}</h6>
                {!data?.length ? (
                    <p className="text-secondary small mb-0">No data for selected period</p>
                ) : (
                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <div className="dashboard-pie-wrap">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey={valueKey}
                                        nameKey={labelKey}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={PIE_COLORS[entry[labelKey]] || '#94A3B8'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-grow-1">
                            {data.map((item, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div
                                            className="dashboard-legend-dot"
                                            style={{ backgroundColor: PIE_COLORS[item[labelKey]] || '#ccc' }}
                                        />
                                        <span className="small fw-medium">{item[labelKey]}</span>
                                    </div>
                                    <div className="text-secondary small">
                                        {amountFormatter
                                            ? amountFormatter(item)
                                            : `${item[valueKey] || 0} records`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4 analytics-dashboard">
                {/* Header */}
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="main-title mb-0">Analytics Dashboard</h4>
                        <p className="text-secondary mb-0">
                            Welcome back, {adminName} · {TIME_FILTER_LABELS[timeFilter]}
                            {lastRefreshed && (
                                <span className="ms-2">
                                    · Updated {formatDate(lastRefreshed)}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0 flex-wrap">
                        <Form.Select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="bg-white"
                            style={{ width: 'auto', minWidth: '140px' }}
                        >
                            <option value="today">Today</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thisYear">This Year</option>
                        </Form.Select>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center gap-2"
                            onClick={() => fetchAnalytics()}
                            disabled={loading}
                        >
                            <i className={`ri-refresh-line ${loading ? 'spin' : ''}`}></i>
                            Refresh
                        </Button>
                    </div>
                </div>

                {fetchError && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
                        <i className="ri-error-warning-line me-2" />
                        {fetchError}
                    </div>
                )}

                {overviewError && (
                    <div className="alert alert-warning py-2 px-3 mb-3 small" role="status">
                        <i className="ri-error-warning-line me-2" />
                        Admin overview failed to load: {overviewError}. KPI counts for users, orders,
                        and products may be incomplete until the API succeeds.
                    </div>
                )}

                {(loading || (overviewLoading && !stats)) && <AnalyticsDashboardSkeleton />}

                {!loading && stats && (
                    <>
                        {/* KPI Row — core metrics */}
                        <div className="dashboard-section-head mb-3">
                            <h6 className="dashboard-section-title mb-1">Main Overview</h6>
                            <p className="dashboard-section-subtitle mb-0">Core performance metrics for daily decisions</p>
                        </div>
                        <Row className="g-3 mb-4">
                            <Col xs={12} sm={6} xl={3}>
                                <DashboardStatCard
                                    label="Total Revenue"
                                    value={formatCurrency(metrics.totalRevenue)}
                                    icon="ri-coins-line"
                                    iconBg="#DCFCE7"
                                    iconColor="#16A34A"
                                    accentColor={KPI_ACCENTS[0]}
                                    subtext={
                                        overviewLoading && !overview
                                            ? 'Loading overview…'
                                            : TIME_FILTER_LABELS[timeFilter]
                                    }
                                />
                            </Col>
                            <Col xs={12} sm={6} xl={3}>
                                <DashboardStatCard
                                    label="Total Orders"
                                    value={metrics.totalOrders}
                                    icon="ri-shopping-cart-2-line"
                                    iconBg="#FFEDD5"
                                    iconColor="#EA580C"
                                    accentColor={KPI_ACCENTS[1]}
                                    subtext={`${metrics.pendingOrders} pending`}
                                />
                            </Col>
                            <Col xs={12} sm={6} xl={3}>
                                <DashboardStatCard
                                    label="Total Customers"
                                    value={metrics.totalUsers}
                                    icon="ri-group-line"
                                    iconBg="#F3E8FF"
                                    iconColor="#9333EA"
                                    accentColor={KPI_ACCENTS[2]}
                                    subtext={`${metrics.activeUsers} active`}
                                />
                            </Col>
                            <Col xs={12} sm={6} xl={3}>
                                <DashboardStatCard
                                    label="Pending Orders"
                                    value={metrics.pendingOrders}
                                    icon="ri-time-line"
                                    iconBg="#FEF3C7"
                                    iconColor="#D97706"
                                    accentColor={KPI_ACCENTS[3]}
                                />
                            </Col>
                        </Row>

                        {/* Quick actions */}
                        <div className="dashboard-section-head mb-3">
                            <h6 className="dashboard-section-title mb-1">Quick Actions</h6>
                            <p className="dashboard-section-subtitle mb-0">Fast access to key management sections</p>
                        </div>
                        <Row className="g-3 mb-4">
                            {QUICK_ACTIONS.map(action => (
                                <Col xs={6} md={3} key={action.path}>
                                    <Link to={action.path} className="text-decoration-none">
                                        <Card className="border-0 shadow-sm dashboard-quick-action h-100">
                                            <Card.Body className="d-flex align-items-center gap-3 py-3">
                                                <div
                                                    className="dashboard-quick-action__icon"
                                                    style={{ backgroundColor: action.bg, color: action.color }}
                                                >
                                                    <i className={action.icon}></i>
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <span className="fw-semibold text-dark d-block">{action.label}</span>
                                                    {action.countKey != null && (
                                                        <span
                                                            className="badge rounded-pill mt-1"
                                                            style={{ backgroundColor: action.bg, color: action.color }}
                                                        >
                                                            {metrics[action.countKey] ?? '—'}
                                                        </span>
                                                    )}
                                                </div>
                                                <i className="ri-arrow-right-s-line ms-auto text-secondary"></i>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>

                        {/* Order status breakdown + pies */}
                        <div className="dashboard-section-head mb-3">
                            <h6 className="dashboard-section-title mb-1">Operations Snapshot</h6>
                            <p className="dashboard-section-subtitle mb-0">Live operational health across orders, payments, and users</p>
                        </div>
                        <Row className="g-3 mb-4">
                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <h6 className="mb-4 fw-bold">Order Pipeline</h6>
                                        {(displayStats.orderStatus || []).length ? (
                                            (displayStats.orderStatus || []).map((item, idx) => (
                                                <div key={idx} className="mb-3">
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <span>{item.status}</span>
                                                        <span className="fw-semibold">{item.count}</span>
                                                    </div>
                                                    <ProgressBar
                                                        now={((item.count || 0) / orderStatusMax) * 100}
                                                        variant={getStatusBadgeColor(item.status)}
                                                        style={{ height: 8 }}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-secondary small mb-0">No order status data</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} lg={4}>
                                {renderPieSection(
                                    'Payment Status',
                                    displayStats.paymentStatus,
                                    'count',
                                    'status',
                                    (item) => `${formatCurrency(item.totalAmount)} (${item.count})`
                                )}
                            </Col>
                            <Col xs={12} lg={4}>
                                {renderPieSection(
                                    'User Activity',
                                    displayStats.userActivity
                                        ? [
                                              { status: 'Active', count: displayStats.userActivity.active },
                                              { status: 'Inactive', count: displayStats.userActivity.inactive },
                                          ]
                                        : [],
                                    'count',
                                    'status',
                                    (item) => `${item.count} users`
                                )}
                            </Col>
                        </Row>

                        {/* Tables — recent orders, top products, low stock */}
                        <div className="dashboard-section-head mb-3">
                            <h6 className="dashboard-section-title mb-1">Business Tables</h6>
                            <p className="dashboard-section-subtitle mb-0">Detailed records for follow-up and action</p>
                        </div>
                        <Row className="g-3 mb-4">
                            <Col xs={12} lg={5}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Recent Orders</h6>
                                            <Link to="/order" className="text-primary text-decoration-none small">View all</Link>
                                        </div>
                                        <div className="table-responsive">
                                            <Table borderless size="sm" className="mb-0">
                                                <thead className="text-secondary small">
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Customer</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentOrders.length ? (
                                                        recentOrders.map(order => (
                                                            <tr key={order._id}>
                                                                <td className="small fw-medium">{order.orderNumber}</td>
                                                                <td className="small text-truncate" style={{ maxWidth: 120 }}>
                                                                    {order.shippingAddress?.firstName}{' '}
                                                                    {order.shippingAddress?.lastName}
                                                                </td>
                                                                <td className="small">
                                                                    {formatOrderCurrency(order.total || order.amount)}
                                                                </td>
                                                                <td>
                                                                    <Badge bg={getStatusBadgeColor(order.status)} className="small">
                                                                        {order.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <EmptyTableRow colSpan={4} message="No recent orders" />
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Top Selling Products</h6>
                                            <Link to="/product" className="text-primary text-decoration-none small">View all</Link>
                                        </div>
                                        <Table borderless size="sm" className="mb-0">
                                            <thead className="text-secondary small">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Product</th>
                                                    <th className="text-end">Sold</th>
                                                    <th className="text-end">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(displayStats.topProducts || []).length ? (
                                                    displayStats.topProducts.map((product, idx) => (
                                                        <tr key={idx}>
                                                            <td className="small text-secondary">{idx + 1}</td>
                                                            <td className="small">{product.name}</td>
                                                            <td className="text-end small">{product.totalQuantitySold}</td>
                                                            <td className="text-end small">{formatCurrency(product.totalRevenue)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <EmptyTableRow colSpan={4} message="No product sales data" />
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} lg={3}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Low Stock</h6>
                                            <Link to="/product" className="text-primary text-decoration-none small">View all</Link>
                                        </div>
                                        <Table borderless size="sm" className="mb-0">
                                            <thead className="text-secondary small">
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-center">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(displayStats.lowStockAlerts || []).length ? (
                                                    displayStats.lowStockAlerts.map((product, idx) => (
                                                        <tr key={idx}>
                                                            <td className="small">{product.name}</td>
                                                            <td className="text-center">
                                                                <Badge bg="danger" className="small">{product.stock}</Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <EmptyTableRow colSpan={2} message="All products in stock" />
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}

                {!loading && !stats && (
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center py-5">
                            <i className="ri-error-warning-line dashboard-empty-icon"></i>
                            <h5 className="mt-3 text-secondary">No data available</h5>
                            <p className="text-secondary">Unable to load analytics. Check API connection.</p>
                            <Button variant="primary" className="mt-2" onClick={() => fetchAnalytics()}>
                                Try Again
                            </Button>
                        </Card.Body>
                    </Card>
                )}

                <Footer />
            </div>
        </React.Fragment>
    );
}

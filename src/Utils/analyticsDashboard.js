/**
 * Derive standard dashboard metrics from analytics API payload.
 */
export const buildDashboardMetrics = (stats = {}) => {
    const summary = stats.summary || {};
    const orderStatus = stats.orderStatus || [];
    const paymentStatus = stats.paymentStatus || [];

    const totalOrders = Number(summary.totalOrders) || 0;
    const totalRevenue = Number(summary.totalRevenue) || 0;
    const totalUsers = Number(summary.totalUsers) || 0;
    const totalProducts = Number(summary.totalProducts) || 0;
    const activeProducts =
        summary.activeProducts != null ? Number(summary.activeProducts) : 0;
    const totalBanners = Number(summary.totalBanners) || 0;

    const getStatusCount = (status) =>
        orderStatus.find(item => item.status === status)?.count || 0;

    const pendingOrders = getStatusCount('Pending');
    const processingOrders = getStatusCount('Processing');
    const shippedOrders = getStatusCount('Shipped');
    const deliveredOrders = getStatusCount('Delivered');
    const cancelledOrders = getStatusCount('Cancelled');

    const completedOrders = deliveredOrders + shippedOrders;
    const fulfillmentRate = totalOrders > 0
        ? Math.round((completedOrders / totalOrders) * 100)
        : 0;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paidPayments = paymentStatus
        .filter(item => ['Paid', 'Completed'].includes(item.status))
        .reduce((sum, item) => sum + (item.count || 0), 0);

    const paymentSuccessRate = totalOrders > 0
        ? Math.round((paidPayments / totalOrders) * 100)
        : 0;

    return {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        activeProducts,
        totalBanners,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        fulfillmentRate,
        averageOrderValue,
        paymentSuccessRate,
        lowStockCount: (stats.lowStockAlerts || []).length,
        activeUsers: stats.userActivity?.active || 0,
        inactiveUsers: stats.userActivity?.inactive || 0,
    };
};

export const formatChartLabel = (value) => {
    if (!value) return 'N/A';
    const str = String(value);
    if (/^\d{4}-\d{2}/.test(str)) {
        const [year, month] = str.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[Number(month) - 1] || month} ${year?.slice(2) || ''}`.trim();
    }
    return str;
};

export const TIME_FILTER_LABELS = {
    today: 'Today',
    last7days: 'Last 7 Days',
    last30days: 'Last 30 Days',
    thisYear: 'This Year',
};

/** Frontend preview — replace with API when backend is ready */
export const MOCK_DASHBOARD_STATS = {
    summary: {
        totalUsers: 1248,
        totalProducts: 86,
        totalBanners: 12,
        totalOrders: 542,
        totalRevenue: 1847650,
    },
    orderStatus: [
        { status: 'Pending', count: 48 },
        { status: 'Processing', count: 62 },
        { status: 'Shipped', count: 95 },
        { status: 'Delivered', count: 298 },
        { status: 'Cancelled', count: 39 },
    ],
    paymentStatus: [
        { status: 'Completed', count: 412, totalAmount: 1523400 },
        { status: 'Pending', count: 89, totalAmount: 245000 },
        { status: 'Failed', count: 41, totalAmount: 79250 },
    ],
    topProducts: [
        { name: '15% Vitamin C Face Serum', totalQuantitySold: 186, totalRevenue: 279000 },
        { name: '2% Kojic Acid Face Serum', totalQuantitySold: 142, totalRevenue: 198800 },
        { name: '10% Vitamin C Face Serum', totalQuantitySold: 118, totalRevenue: 165200 },
        { name: 'Hyaluronic Moisturizer', totalQuantitySold: 96, totalRevenue: 134400 },
        { name: 'SPF 50 Sunscreen', totalQuantitySold: 74, totalRevenue: 103600 },
    ],
    lowStockAlerts: [
        { name: 'Retinol Night Cream', stock: 4, price: 1299 },
        { name: 'Niacinamide Toner', stock: 7, price: 599 },
        { name: 'Under Eye Gel', stock: 9, price: 449 },
    ],
    userActivity: { active: 892, inactive: 356 },
};

const MOCK_CHART_BY_INTERVAL = {
    daily: [
        { name: 'Mon', Sales: 42, Revenue: 62000, Orders: 42 },
        { name: 'Tue', Sales: 38, Revenue: 54000, Orders: 38 },
        { name: 'Wed', Sales: 55, Revenue: 78000, Orders: 55 },
        { name: 'Thu', Sales: 48, Revenue: 71000, Orders: 48 },
        { name: 'Fri', Sales: 62, Revenue: 92000, Orders: 62 },
        { name: 'Sat', Sales: 71, Revenue: 105000, Orders: 71 },
        { name: 'Sun', Sales: 58, Revenue: 86000, Orders: 58 },
    ],
    weekly: [
        { name: 'Week 1', Sales: 210, Revenue: 310000, Orders: 210 },
        { name: 'Week 2', Sales: 245, Revenue: 358000, Orders: 245 },
        { name: 'Week 3', Sales: 198, Revenue: 292000, Orders: 198 },
        { name: 'Week 4', Sales: 289, Revenue: 425000, Orders: 289 },
    ],
    monthly: [
        { name: 'Jan', Sales: 820, Revenue: 1180000, Orders: 820 },
        { name: 'Feb', Sales: 760, Revenue: 1095000, Orders: 760 },
        { name: 'Mar', Sales: 910, Revenue: 1320000, Orders: 910 },
        { name: 'Apr', Sales: 880, Revenue: 1275000, Orders: 880 },
        { name: 'May', Sales: 942, Revenue: 1365000, Orders: 942 },
    ],
};

export const MOCK_RECENT_ORDERS = [
    {
        _id: '1',
        orderNumber: 'CV-2026-1042',
        status: 'Processing',
        total: 2499,
        createdAt: new Date().toISOString(),
        shippingAddress: { firstName: 'Priya', lastName: 'Sharma' },
    },
    {
        _id: '2',
        orderNumber: 'CV-2026-1041',
        status: 'Delivered',
        total: 1899,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        shippingAddress: { firstName: 'Rahul', lastName: 'Verma' },
    },
    {
        _id: '3',
        orderNumber: 'CV-2026-1040',
        status: 'Shipped',
        total: 3298,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        shippingAddress: { firstName: 'Ananya', lastName: 'Gupta' },
    },
    {
        _id: '4',
        orderNumber: 'CV-2026-1039',
        status: 'Pending',
        total: 999,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        shippingAddress: { firstName: 'Vikram', lastName: 'Singh' },
    },
    {
        _id: '5',
        orderNumber: 'CV-2026-1038',
        status: 'Delivered',
        total: 4599,
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        shippingAddress: { firstName: 'Sneha', lastName: 'Patel' },
    },
];

export const getMockDashboardPreview = (interval = 'monthly') => ({
    stats: MOCK_DASHBOARD_STATS,
    chartData: MOCK_CHART_BY_INTERVAL[interval] || MOCK_CHART_BY_INTERVAL.monthly,
    recentOrders: MOCK_RECENT_ORDERS,
});

import React, { useEffect, useState } from 'react';
import Header from '../../layouts/Header';
import { Card, CardBody, CardTitle, Row, Col, Input, Label, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Button, Badge, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import ConfirmModal from '../../components/ConfirmModal';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import OrderItemsCell, {
    getOrderItemName,
    getOrderItemImage,
    PRODUCT_IMAGE_PLACEHOLDER
} from '../../components/OrderItemsCell';
import Footer from '../../layouts/Footer';
import OrderActionsMenu from '../../components/admin/OrderActionsMenu';
import { dataTableWideStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';
import moment from 'moment';
import {
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    updateBulkOrderStatus,
    deleteOrders,
    formatCurrency,
    computeOrderStatistics,
    getStatusBadgeColor,
    getPaymentStatusBadgeColor,
    getOrderStatuses,
    getPaymentMethods,
    getPaymentStatuses
} from '../../helper/order_helper';
import {
    createShipcluesShipmentFromOrder,
    getShipcluesErrorMessage
} from '../../helper/shipclues_helper';

function OrderDetailsContent({ data }) {
    const orderItems = data?.items || [];
    const shippingAddress = data?.shippingAddress || data?.address || {};

    return (
        <div>
            <Row className="g-3 mb-3">
                <Col sm={6}>
                    <span className="text-muted small">Order #</span>
                    <div className="fw-semibold">{data?.orderNumber}</div>
                </Col>
                <Col sm={6}>
                    <span className="text-muted small">Date</span>
                    <div className="fw-semibold">
                        {data?.createdAt ? moment(data.createdAt).format('DD MMM YYYY, hh:mm A') : '—'}
                    </div>
                </Col>
                <Col sm={6}>
                    <span className="text-muted small">Status</span>
                    <div>
                        <Badge bg={getStatusBadgeColor(data?.status)}>{data?.status}</Badge>
                    </div>
                </Col>
                <Col sm={6}>
                    <span className="text-muted small">Payment</span>
                    <div className="d-flex gap-1 flex-wrap">
                        <Badge bg="secondary">{data?.paymentMethod}</Badge>
                        <Badge bg={getPaymentStatusBadgeColor(data?.paymentStatus)}>{data?.paymentStatus}</Badge>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <h6 className="mb-3 fw-bold">
                        <i className="ri-shopping-bag-line me-1" />
                        Order Items ({orderItems.length})
                    </h6>
                    {orderItems.length > 0 ? (
                        <div className="order-items-cell" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                            {orderItems.map((item, index) => (
                                <div className="order-item-row" key={index}>
                                    <span className="order-item-seq">{String(index + 1).padStart(2, '0')}</span>
                                    <img
                                        src={getOrderItemImage(item) || PRODUCT_IMAGE_PLACEHOLDER}
                                        alt={getOrderItemName(item)}
                                        className="order-item-thumb"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = PRODUCT_IMAGE_PLACEHOLDER;
                                        }}
                                    />
                                    <div className="order-item-body">
                                        <p className="order-item-name">{getOrderItemName(item)}</p>
                                        <p className="order-item-meta">
                                            Size: <strong>{item.size || 'N/A'}</strong> · Qty: <strong>{item.quantity}</strong>
                                        </p>
                                        <p className="order-item-meta mb-0 text-primary">
                                            <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                            <span className="text-muted"> ({formatCurrency(item.price)} each)</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">No items in this order</p>
                    )}
                </Col>
                <Col md={6}>
                    <h6 className="mb-3 fw-bold">
                        <i className="ri-map-pin-line me-1" />
                        Shipping Address
                    </h6>
                    <Card className="mb-3 border">
                        <CardBody className="p-3">
                            <p className="mb-1">
                                <strong>{shippingAddress.firstName} {shippingAddress.lastName}</strong>
                            </p>
                            <p className="mb-1 text-muted small">{shippingAddress.street}</p>
                            <p className="mb-1 text-muted small">
                                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zipcode}
                            </p>
                            <p className="mb-1 text-muted small">{shippingAddress.country}</p>
                            <p className="mb-1 text-muted small">
                                <i className="ri-mail-line me-1" />
                                {shippingAddress.email}
                            </p>
                            <p className="mb-0 text-muted small">
                                <i className="ri-phone-line me-1" />
                                {shippingAddress.phone}
                            </p>
                        </CardBody>
                    </Card>
                    <h6 className="mb-3 fw-bold">
                        <i className="ri-bill-line me-1" />
                        Order Summary
                    </h6>
                    <Card className="border">
                        <CardBody className="p-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal:</span>
                                <span><strong>{formatCurrency(data.subtotal || 0)}</strong></span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Shipping Fee:</span>
                                <span><strong>{formatCurrency(data.shippingFee || 0)}</strong></span>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold">Total:</span>
                                <span className="fw-bold text-primary">
                                    {formatCurrency(data.total || data.amount || 0)}
                                </span>
                            </div>
                            {data.razorpayOrderId && (
                                <div className="mt-2 p-2 bg-light rounded">
                                    <small className="text-muted d-block">Razorpay Order ID:</small>
                                    <small style={{ wordBreak: 'break-all' }}>{data.razorpayOrderId}</small>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

function Order() {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [statusUpdate, setStatusUpdate] = useState({ show: false, orderId: null, currentStatus: '', newStatus: '' });
    const [bulkStatusUpdate, setBulkStatusUpdate] = useState({ show: false, newStatus: 'Pending' });
    const [deleteModal, setDeleteModal] = useState({ show: false, orderIds: [], label: '' });
    const [selectedRows, setSelectedRows] = useState([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [creatingShipmentId, setCreatingShipmentId] = useState(null);
    const [createdShipments, setCreatedShipments] = useState({});
    const [viewOrder, setViewOrder] = useState(null);
    const [isInitialMount, setIsInitialMount] = useState(true);

    // Pagination and Filters
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        search: '',
        status: '',
        paymentMethod: '',
        paymentStatus: '',
        sortBy: 'date',
        order: 'desc',
        startDate: '',
        endDate: ''
    });

    // Statistics
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        averageOrderValue: 0,
        totalOrders: 0
    });

    const orderStatuses = getOrderStatuses();
    const paymentMethods = getPaymentMethods();
    const paymentStatuses = getPaymentStatuses();

    useEffect(() => {
        loadColumns();
        getData();
        setIsInitialMount(false);
    }, []);

    useEffect(() => {
        loadColumns();
    }, [creatingShipmentId, createdShipments]);

    // Refetch data when filters change (but not on initial mount)
    useEffect(() => {
        if (isInitialMount) return; // Skip on initial mount

        const timeoutId = setTimeout(() => {
            getData();
        }, 300); // Debounce to prevent too many calls

        return () => clearTimeout(timeoutId);
    }, [
        filters.page,
        filters.limit,
        filters.search,
        filters.status,
        filters.paymentMethod,
        filters.paymentStatus,
        filters.sortBy,
        filters.order,
        filters.startDate,
        filters.endDate
    ]);

    const loadColumns = () => {
        setColumns([
            {
                name: 'Products',
                selector: row => row.items?.map(item => getOrderItemName(item)).join(', '),
                sortable: false,
                width: '320px',
                cell: row => <OrderItemsCell items={row.items} maxVisible={3} />
            },
            {
                name: 'Order #',
                selector: row => row.orderNumber,
                sortable: true,
                width: '160px',
                cell: row => (
                    <div className="order-number-cell">
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                            {row.orderNumber}
                        </div>
                        <small className="text-muted">
                            {moment(row.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </small>
                    </div>
                )
            },
            {
                name: 'Customer',
                selector: row => row.shippingAddress?.firstName,
                sortable: true,
                width: '180px',
                cell: row => (
                    <div>
                        <div style={{ fontWeight: '500' }}>
                            {row.shippingAddress?.firstName} {row.shippingAddress?.lastName}
                        </div>
                        <small className="text-muted">{row.shippingAddress?.email}</small>
                    </div>
                )
            },
            {
                name: 'Total Amount',
                selector: row => row.total || row.amount,
                sortable: true,
                width: '130px',
                cell: row => (
                    <strong style={{ color: '#007bff' }}>
                        {formatCurrency(row.total || row.amount)}
                    </strong>
                )
            },
            {
                name: 'Status',
                selector: row => row.status,
                sortable: true,
                width: '150px',
                cell: row => (
                    <Badge bg={getStatusBadgeColor(row.status)}>
                        {row.status}
                    </Badge>
                )
            },
            {
                name: 'Payment',
                selector: row => row.paymentMethod,
                sortable: true,
                width: '150px',
                cell: row => (
                    <div>
                        <Badge bg="secondary" className="mb-1">{row.paymentMethod}</Badge>
                        <br />
                        <Badge bg={getPaymentStatusBadgeColor(row.paymentStatus)} style={{ fontSize: '10px' }}>
                            {row.paymentStatus}
                        </Badge>
                    </div>
                )
            },
            {
                name: 'Actions',
                width: '110px',
                minWidth: '110px',
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
                cell: row => {
                    const isCreating = creatingShipmentId === row._id;
                    const isAlreadyCreated = Boolean(
                        row.shipcluesOrderId ||
                        row.shipcluesShipmentId ||
                        createdShipments[row._id]
                    );

                    return (
                        <OrderActionsMenu
                            row={row}
                            isCreating={isCreating}
                            isAlreadyCreated={isAlreadyCreated}
                            onView={setViewOrder}
                            onStatus={handleStatusChange}
                            onShip={handleCreateShipment}
                            onDelete={(r) => handleDeleteClick([r._id], r.orderNumber)}
                        />
                    );
                }
            }
        ]);
    };

    const getData = async () => {
        if (loading) return; // Prevent multiple simultaneous calls

        setLoading(true);
        try {
            const params = {};

            // Only add non-empty filter values
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;
            if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
            if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
            if (filters.sortBy) params.sortBy = filters.sortBy;
            if (filters.order) params.order = filters.order;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            console.log('Fetching orders with params:', params);

            const response = await getAllOrders(user?.token, params);

            console.log('API Response:', response);

            if (response?.success) {
                // Handle different response structures
                const orders = response.orders || response.data?.orders || [];
                setData(orders);

                // Update pagination
                if (response.data?.pagination) {
                    setPagination(response.data.pagination);
                } else if (response.pagination) {
                    setPagination(response.pagination);
                } else {
                    setPagination({
                        currentPage: filters.page,
                        totalPages: 1,
                        totalOrders: orders.length
                    });
                }

                const apiStats = response.data?.statistics || response.statistics;
                const computedStats = computeOrderStatistics(orders, response.data?.pagination || response.pagination || {
                    totalOrders: orders.length,
                });

                if (apiStats && Number(apiStats.totalRevenue) > 0) {
                    setStatistics(apiStats);
                } else {
                    setStatistics(computedStats);
                }

                // Only show success message if we have orders
                if (orders.length === 0) {
                    console.log('No orders found');
                }
            } else {
                toast.error(response?.message || 'Failed to fetch orders');
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error loading orders');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (order) => {
        setStatusUpdate({
            show: true,
            orderId: order._id,
            currentStatus: order.status,
            newStatus: order.status
        });
    };

    const handleCreateShipment = async (order) => {
        if (!order?._id) {
            toast.error('Invalid order selected');
            return;
        }

        if (creatingShipmentId) return;

        setCreatingShipmentId(order._id);

        try {
            const response = await createShipcluesShipmentFromOrder(order, user?.token);

            setCreatedShipments(prev => ({
                ...prev,
                [order._id]: response?.data || true
            }));

            toast.success(
                response?.message ||
                `Shipment created on Shipclues for order ${order.orderNumber}`
            );
        } catch (error) {
            console.error('Shipclues shipment error:', error);
            toast.error(getShipcluesErrorMessage(error));
        } finally {
            setCreatingShipmentId(null);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusUpdate.newStatus) {
            toast.error('Please select a status');
            return;
        }

        if (statusUpdate.newStatus === statusUpdate.currentStatus) {
            toast.info('Status is already set to ' + statusUpdate.newStatus);
            setStatusUpdate({ show: false, orderId: null, currentStatus: '', newStatus: '' });
            return;
        }

        setLoading(true);
        try {
            const response = await updateOrderStatus(
                statusUpdate.orderId,
                statusUpdate.newStatus,
                user?.token
            );

            if (response?.success) {
                toast.success(response.message || 'Order status updated successfully');
                setStatusUpdate({ show: false, orderId: null, currentStatus: '', newStatus: '' });
                getData();
            } else {
                toast.error(response?.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');
        } finally {
            setLoading(false);
        }
    };

    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);

    const clearSelection = () => {
        setSelectedRows([]);
        setToggleCleared(prev => !prev);
    };

    const handleDeleteClick = (orderIds, label) => {
        const ids = Array.isArray(orderIds) ? orderIds.filter(Boolean) : [orderIds].filter(Boolean);
        if (!ids.length) return;

        const displayLabel = Array.isArray(label)
            ? `${label.length} order(s)`
            : label || `${ids.length} order(s)`;

        setDeleteModal({
            show: true,
            orderIds: ids,
            label: displayLabel
        });
    };

    const handleBulkDeleteClick = () => {
        if (!selectedRows.length) {
            toast.warning('No orders selected');
            return;
        }
        handleDeleteClick(
            selectedRows.map(row => row._id),
            `${selectedRows.length} order(s)`
        );
    };

    const handleBulkStatusOpen = () => {
        if (!selectedRows.length) {
            toast.warning('No orders selected');
            return;
        }
        setBulkStatusUpdate({ show: true, newStatus: 'Pending' });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.orderIds.length) return;

        setLoading(true);
        try {
            const { successCount, failCount } = await deleteOrders(deleteModal.orderIds, user?.token);

            if (successCount > 0) {
                toast.success(`Deleted ${successCount} order(s) successfully`);
                setDeleteModal({ show: false, orderIds: [], label: '' });
                clearSelection();
                getData();
            }
            if (failCount > 0) {
                toast.error(`Failed to delete ${failCount} order(s)`);
            }
        } catch (error) {
            console.error('Error deleting orders:', error);
            toast.error('Error deleting orders');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkStatusUpdate = async () => {
        if (!bulkStatusUpdate.newStatus) {
            toast.error('Please select a status');
            return;
        }

        const orderIds = selectedRows.map(row => row._id).filter(Boolean);
        if (!orderIds.length) {
            toast.warning('No orders selected');
            return;
        }

        setLoading(true);
        try {
            const { successCount, failCount } = await updateBulkOrderStatus(
                orderIds,
                bulkStatusUpdate.newStatus,
                user?.token
            );

            if (successCount > 0) {
                toast.success(`Updated status for ${successCount} order(s)`);
                setBulkStatusUpdate({ show: false, newStatus: 'Pending' });
                clearSelection();
                getData();
            }
            if (failCount > 0) {
                toast.error(`Failed to update ${failCount} order(s)`);
            }
        } catch (error) {
            console.error('Error updating bulk order status:', error);
            toast.error('Error updating order status');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value // Reset to page 1 when filters change
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            search: '',
            status: '',
            paymentMethod: '',
            paymentStatus: '',
            sortBy: 'date',
            order: 'desc',
            startDate: '',
            endDate: ''
        });
    };

    const handlePageChange = (page) => {
        handleFilterChange('page', page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setFilters(prev => ({
            ...prev,
            limit: newPerPage,
            page: page
        }));
    };

    return (
        <>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="main-page-header d-md-flex align-items-center justify-content-between">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Order Management</li>
                        </ol>
                        <h4 className="main-title mb-0">Order Management</h4>
                    </div>
                </div>

                {/* Statistics Cards */}
                <Row className="g-3 mb-4">
                    {[
                        {
                            label: 'Total Orders',
                            value: pagination.totalOrders || data.length,
                            icon: 'ri-shopping-cart-2-line',
                            bg: '#FFEDD5',
                            color: '#EA580C',
                            accent: '#EA580C',
                        },
                        {
                            label: 'Total Revenue',
                            value: formatCurrency(statistics.totalRevenue),
                            icon: 'ri-coins-line',
                            bg: '#DCFCE7',
                            color: '#16A34A',
                            accent: '#16A34A',
                        },
                        {
                            label: 'Average Order Value',
                            value: formatCurrency(statistics.averageOrderValue),
                            icon: 'ri-line-chart-line',
                            bg: '#DBEAFE',
                            color: '#2563EB',
                            accent: '#2563EB',
                        },
                    ].map(stat => (
                        <Col md={4} key={stat.label}>
                            <Card className="card-one order-stat-card shadow-sm" style={{ '--order-stat-accent': stat.accent }}>
                                <CardBody className="d-flex align-items-center justify-content-between gap-2">
                                    <div>
                                        <Label className="card-label fs-sm fw-medium mb-1 text-secondary">{stat.label}</Label>
                                        <h3 className="card-value mb-0">{stat.value}</h3>
                                    </div>
                                    <div className="order-stat-card__icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                        <i className={stat.icon} />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Filters */}
                <Card className="card-one mb-3">
                    <CardBody>
                        <h6 className="mb-3 fw-semibold">
                            <i className="ri-filter-3-line me-1" />
                            Filters
                        </h6>
                        <Row className="g-3">
                            {/* Search */}
                            <Col md={3}>
                                <Label>Search</Label>
                                <Input
                                    type="text"
                                    placeholder="Order #, Name, Email, Phone..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </Col>

                            {/* Status Filter */}
                            <Col md={3}>
                                <Label>Order Status</Label>
                                <Input
                                    type="select"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {orderStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Input>
                            </Col>

                            {/* Payment Method Filter */}
                            <Col md={3}>
                                <Label>Payment Method</Label>
                                <Input
                                    type="select"
                                    value={filters.paymentMethod}
                                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                >
                                    <option value="">All Methods</option>
                                    {paymentMethods.map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </Input>
                            </Col>

                            {/* Payment Status Filter */}
                            <Col md={3}>
                                <Label>Payment Status</Label>
                                <Input
                                    type="select"
                                    value={filters.paymentStatus}
                                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                >
                                    <option value="">All Payment Statuses</option>
                                    {paymentStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Input>
                            </Col>

                            {/* Start Date */}
                            <Col md={3}>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </Col>

                            {/* End Date */}
                            <Col md={3}>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </Col>

                            {/* Sort By */}
                            <Col md={3}>
                                <Label>Sort By</Label>
                                <Input
                                    type="select"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="date">Date</option>
                                    <option value="total">Total Amount</option>
                                    <option value="status">Status</option>
                                </Input>
                            </Col>

                            {/* Sort Order */}
                            <Col md={3}>
                                <Label>Sort Order</Label>
                                <Input
                                    type="select"
                                    value={filters.order}
                                    onChange={(e) => handleFilterChange('order', e.target.value)}
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </Input>
                            </Col>
                        </Row>

                        <div className="mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleResetFilters}
                            >
                                <i className="ri-restart-line"></i> Reset Filters
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Orders Table */}
                <Card className="card-one orders-table-card">
                    <CardBody className="orders-table-card__body">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                            <CardTitle tag="h6" className="mb-0">
                                <i className="ri-list-check me-1" />
                                All Orders ({pagination.totalOrders || data.length})
                            </CardTitle>
                            {selectedRows.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button variant="primary" size="sm" onClick={handleBulkStatusOpen}>
                                        <i className="ri-refresh-line me-1"></i>
                                        Update Status ({selectedRows.length})
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={handleBulkDeleteClick}>
                                        <i className="ri-delete-bin-line me-1"></i>
                                        Delete ({selectedRows.length})
                                    </Button>
                                </div>
                            )}
                        </div>

                        <p className="text-muted small mb-2 orders-table-scroll-hint">
                            <i className="ri-arrow-left-right-line me-1" />
                            Scroll horizontally to see Payment and Actions
                        </p>

                        <div className="admin-datatable-scroll orders-datatable-wrap">
                            <DataTable
                                columns={columns}
                                data={data}
                                pagination
                                paginationServer
                                paginationTotalRows={pagination.totalOrders}
                                paginationDefaultPage={filters.page}
                                paginationPerPage={filters.limit}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handlePerRowsChange}
                                progressPending={loading}
                                progressComponent={<DataTableSkeleton rows={8} columns={7} />}
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                customStyles={dataTableWideStyles}
                                paginationComponentOptions={dataTablePaginationOptions}
                                highlightOnHover
                                striped
                                noDataComponent={
                                    <div className="text-center py-4">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
                                        <p className="text-muted mt-2">No orders found</p>
                                    </div>
                                }
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Status Update Modal */}
                {statusUpdate.show && (
                    <ConfirmModal
                        show={statusUpdate.show}
                        onCloseClick={() => setStatusUpdate({ show: false, orderId: null, currentStatus: '', newStatus: '' })}
                        onConfirm={handleStatusUpdate}
                        data={{
                            actionType: 'OrderStatusUpdate',
                            currentStatus: statusUpdate.currentStatus,
                            newStatus: statusUpdate.newStatus,
                            setNewStatus: (val) => setStatusUpdate(prev => ({ ...prev, newStatus: val })),
                            orderStatuses: orderStatuses
                        }}
                    />
                )}

                {bulkStatusUpdate.show && (
                    <ConfirmModal
                        show={bulkStatusUpdate.show}
                        onCloseClick={() => setBulkStatusUpdate({ show: false, newStatus: 'Pending' })}
                        onConfirm={handleBulkStatusUpdate}
                        data={{
                            actionType: 'OrderBulkStatusUpdate',
                            newStatus: bulkStatusUpdate.newStatus,
                            setNewStatus: (val) => setBulkStatusUpdate(prev => ({ ...prev, newStatus: val })),
                            orderStatuses: orderStatuses,
                            selectedCount: selectedRows.length
                        }}
                    />
                )}

                {deleteModal.show && (
                    <ConfirmModal
                        show={deleteModal.show}
                        onCloseClick={() => setDeleteModal({ show: false, orderIds: [], label: '' })}
                        onConfirm={handleDeleteConfirm}
                        data={{
                            actionType: 'Delete',
                            message: `Delete ${deleteModal.label}? This action cannot be undone.`
                        }}
                    />
                )}

                <Modal isOpen={Boolean(viewOrder)} toggle={() => setViewOrder(null)} size="lg" centered>
                    <ModalHeader toggle={() => setViewOrder(null)}>
                        Order Details — {viewOrder?.orderNumber}
                    </ModalHeader>
                    <ModalBody>
                        {viewOrder && <OrderDetailsContent data={viewOrder} />}
                    </ModalBody>
                </Modal>

                <Footer />
            </div>
        </>
    );
}

export default Order;

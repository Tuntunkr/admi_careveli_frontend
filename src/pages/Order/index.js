import React, { useEffect, useState } from 'react';
import Header from '../../layouts/Header';
import { Card, CardBody, CardTitle, Row, Col, Input, Label } from 'reactstrap';
import { Button, Badge, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';
import {
    getAllOrders,
    updateOrderStatus,
    formatCurrency,
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

// Custom styles for expandable rows
const expandableRowStyles = {
    backgroundColor: '#f8f9fa',
    borderTop: '2px solid #007bff',
    borderBottom: '2px solid #007bff'
};

function Order() {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [statusUpdate, setStatusUpdate] = useState({ show: false, orderId: null, currentStatus: '', newStatus: '' });
    const [creatingShipmentId, setCreatingShipmentId] = useState(null);
    const [createdShipments, setCreatedShipments] = useState({});
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

    // Expandable Row Component - Order Details
    const ExpandedComponent = ({ data }) => {
        const orderItems = data?.items || [];
        const shippingAddress = data?.shippingAddress || data?.address || {};

        return (
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
                <Row>
                    {/* Order Items */}
                    <Col md={6}>
                        <h6 className="mb-3" style={{ fontWeight: 'bold', color: '#333' }}>
                            📦 Order Items ({orderItems.length})
                        </h6>
                        {orderItems.length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {orderItems.map((item, index) => (
                                    <Card key={index} className="mb-2" style={{ border: '1px solid #dee2e6' }}>
                                        <CardBody className="p-3">
                                            <Row>
                                                <Col xs={3}>
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '80px',
                                                                objectFit: 'cover',
                                                                borderRadius: '5px'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                    )}
                                                </Col>
                                                <Col xs={9}>
                                                    <h6 className="mb-1">{item.name}</h6>
                                                    <p className="mb-1 text-muted small">
                                                        Size: <strong>{item.size || 'N/A'}</strong>
                                                    </p>
                                                    <p className="mb-1 text-muted small">
                                                        Quantity: <strong>{item.quantity}</strong>
                                                    </p>
                                                    <p className="mb-0 text-primary">
                                                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                                        <span className="text-muted small"> ({formatCurrency(item.price)} each)</span>
                                                    </p>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">No items in this order</p>
                        )}
                    </Col>

                    {/* Shipping Address & Order Summary */}
                    <Col md={6}>
                        {/* Shipping Address */}
                        <h6 className="mb-3" style={{ fontWeight: 'bold', color: '#333' }}>📍 Shipping Address</h6>
                        <Card className="mb-3" style={{ border: '1px solid #dee2e6' }}>
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
                                    📧 {shippingAddress.email}
                                </p>
                                <p className="mb-0 text-muted small">
                                    📱 {shippingAddress.phone}
                                </p>
                            </CardBody>
                        </Card>

                        {/* Order Summary */}
                        <h6 className="mb-3" style={{ fontWeight: 'bold', color: '#333' }}>💰 Order Summary</h6>
                        <Card style={{ border: '1px solid #dee2e6' }}>
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
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Total:</span>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                                        {formatCurrency(data.total || data.amount || 0)}
                                    </span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted small">Payment Method:</span>
                                    <Badge bg="secondary">{data.paymentMethod}</Badge>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">Payment Status:</span>
                                    <Badge bg={getPaymentStatusBadgeColor(data.paymentStatus)}>
                                        {data.paymentStatus}
                                    </Badge>
                                </div>
                                {data.razorpayOrderId && (
                                    <div className="mt-2 p-2" style={{ backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
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
    };

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
                name: 'Order #',
                selector: row => row.orderNumber,
                sortable: true,
                width: '160px',
                cell: row => (
                    <div>
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
                name: 'Items',
                selector: row => row.items?.length || 0,
                sortable: true,
                width: '80px',
                center: true,
                cell: row => (
                    <Badge bg="info">
                        {row.items?.length || 0}
                    </Badge>
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
                width: '240px',
                cell: row => {
                    const isCreating = creatingShipmentId === row._id;
                    const isAlreadyCreated = Boolean(
                        row.shipcluesOrderId ||
                        row.shipcluesShipmentId ||
                        createdShipments[row._id]
                    );

                    return (
                        <div className="d-flex gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleStatusChange(row)}
                                title="Update Status"
                            >
                                <i className="ri-refresh-line"></i> Status
                            </Button>
                            <Button
                                size="sm"
                                variant={isAlreadyCreated ? 'secondary' : 'success'}
                                disabled={isCreating || isAlreadyCreated}
                                onClick={() => handleCreateShipment(row)}
                                title={
                                    isAlreadyCreated
                                        ? 'Shipment already created on Shipclues'
                                        : 'Create shipment on Shipclues'
                                }
                            >
                                {isCreating ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                        Creating...
                                    </>
                                ) : isAlreadyCreated ? (
                                    <>
                                        <i className="ri-check-line"></i> Created
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-truck-line"></i> Ship
                                    </>
                                )}
                            </Button>
                        </div>
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

                // Update statistics if available
                if (response.data?.statistics) {
                    setStatistics(response.data.statistics);
                } else if (response.statistics) {
                    setStatistics(response.statistics);
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
                getData(); // Refresh the list
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
                <div className="d-md-flex align-items-center justify-content-between mb-4">
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
                    <Col md={4}>
                        <Card className="card-one">
                            <CardBody>
                                <Label className="card-label fs-sm fw-medium mb-1">Total Orders</Label>
                                <h3 className="card-value mb-0">
                                    {pagination.totalOrders || data.length}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="card-one">
                            <CardBody>
                                <Label className="card-label fs-sm fw-medium mb-1">Total Revenue</Label>
                                <h3 className="card-value mb-0">
                                    {formatCurrency(statistics.totalRevenue)}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="card-one">
                            <CardBody>
                                <Label className="card-label fs-sm fw-medium mb-1">Average Order Value</Label>
                                <h3 className="card-value mb-0">
                                    {formatCurrency(statistics.averageOrderValue)}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className="card-one mb-3">
                    <CardBody>
                        <h6 className="mb-3">🔍 Filters</h6>
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
                <Card className="card-one">
                    <CardBody>
                        <CardTitle tag="h6" className="mb-3">
                            📦 All Orders  ({pagination.totalOrders || data.length})
                        </CardTitle>

                        {loading ? (
                            <Loader />
                        ) : (
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
                                expandableRows
                                expandableRowsComponent={ExpandedComponent}
                                expandableRowsComponentProps={{ style: expandableRowStyles }}
                                highlightOnHover
                                striped
                                responsive
                                noDataComponent={
                                    <div className="text-center py-4">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
                                        <p className="text-muted mt-2">No orders found</p>
                                    </div>
                                }
                            />
                        )}
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

                <Footer />
            </div>
        </>
    );
}

export default Order;

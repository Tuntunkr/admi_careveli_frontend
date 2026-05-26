import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import { fetchPaymentHistory } from "../../helper/payment_helper";
import moment from "moment";
import { Table, Pagination, Badge, Card, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PaymentHistory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const result = await fetchPaymentHistory(page, limit, status);
        if (result && result.success) {
            setData(result.data);
            if (result.pagination) {
                setTotalPages(result.pagination.pages);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, status]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "success":
                return <Badge bg="success">Success</Badge>;
            case "pending":
                return <Badge bg="warning">Pending</Badge>;
            case "failed":
                return <Badge bg="danger">Failed</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <React.Fragment>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Payment History</li>
                        </ol>
                        <h4 className="main-title mb-0">Payment History</h4>
                    </div>
                </div>

                <Card>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                <select className="form-select w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                                    <option value="">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Transaction ID</th>
                                            <th scope="col">User</th>
                                            <th scope="col">Order ID</th>
                                            <th scope="col">Amount</th>
                                            <th scope="col">Method</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length > 0 ? (
                                            data.map((item, index) => (
                                                <tr key={item._id || index}>
                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                    <td>{item.transactionId || "-"}</td>
                                                    <td>
                                                        {item.user ? (
                                                            <>
                                                                <div>{item.user.name}</div>
                                                                <div className="text-muted small">{item.user.email}</div>
                                                            </>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </td>
                                                    <td>{item.orderId?.orderNumber || item.orderId?._id || "-"}</td>
                                                    <td>{item.currency} {item.amount}</td>
                                                    <td>{item.paymentMethod || "-"}</td>
                                                    <td>{getStatusBadge(item.status)}</td>
                                                    <td>{moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">
                                                    No payment history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-end mt-3">
                                <Pagination>
                                    <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                                    <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => handlePageChange(i + 1)}>
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
                                </Pagination>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </React.Fragment>
    );
}

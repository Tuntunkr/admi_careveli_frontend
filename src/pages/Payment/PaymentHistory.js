import React, { useEffect, useMemo, useState } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import { fetchPaymentHistory } from "../../helper/payment_helper";
import moment from "moment";
import { Table, Pagination, Badge, Card, Form, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import DataTableSkeleton from "../../components/DataTableSkeleton";

const normalizePaymentList = (res) => {
  if (Array.isArray(res)) return res;

  const candidates = [
    res?.data?.payments,
    res?.data?.history,
    res?.data?.items,
    res?.data?.list,
    res?.data,
    res?.payments,
    res?.history,
    res?.list,
  ];

  const firstArray = candidates.find((item) => Array.isArray(item));
  return firstArray || [];
};

const normalizePagination = (res) => {
  const p = res?.pagination || res?.data?.pagination;
  if (!p) return null;
  return {
    page: Number(p.page) || 1,
    pages: Number(p.pages) || Number(p.totalPages) || 1,
    total: Number(p.total) || 0,
    limit: Number(p.limit) || 10,
  };
};

const getTransactionId = (item) =>
  item?.transactionId ||
  item?.transaction_id ||
  item?.razorpayPaymentId ||
  item?.paymentId ||
  item?.payment_id ||
  "—";

const getUserName = (item) =>
  item?.user?.name ||
  item?.userName ||
  item?.customerName ||
  item?.name ||
  "—";

const getUserEmail = (item) =>
  item?.user?.email ||
  item?.userEmail ||
  item?.email ||
  "—";

const getOrderRef = (item) =>
  item?.orderId?.orderNumber ||
  item?.order?.orderNumber ||
  item?.orderNumber ||
  item?.orderId?._id ||
  item?.orderId ||
  "—";

const getAmount = (item) => {
  const amount = item?.amount ?? item?.total ?? item?.paidAmount;
  if (amount === null || amount === undefined || amount === "") return "—";
  return amount;
};

const getCurrency = (item) => item?.currency || "INR";

const getPaymentMethod = (item) =>
  item?.paymentMethod || item?.method || item?.payment_mode || "—";

const formatAmount = (item) => {
  const amount = getAmount(item);
  if (amount === "—") return "—";
  const num = Number(amount);
  if (Number.isNaN(num)) return `${getCurrency(item)} ${amount}`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: getCurrency(item),
    minimumFractionDigits: 0,
  }).format(num);
};

export default function PaymentHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [status, setStatus] = useState("");
  const [searchTx, setSearchTx] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const result = await fetchPaymentHistory(params);
      const list = normalizePaymentList(result);
      const pagination = normalizePagination(result);

      if (result?.success === false && !list.length) {
        toast.error(result?.message || "Failed to load payment history");
        setData([]);
        setTotalPages(1);
        setTotalRecords(0);
        return;
      }

      setData(list);

      if (pagination) {
        setTotalPages(Math.max(pagination.pages, 1));
        setTotalRecords(pagination.total);
      } else {
        setTotalPages(Math.max(Math.ceil(list.length / limit), 1));
        setTotalRecords(list.length);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error(error?.message || "Failed to load payment history");
      setData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, status]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const displayData = useMemo(() => {
    const q = searchTx.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      String(getTransactionId(item)).toLowerCase().includes(q) ||
      String(getOrderRef(item)).toLowerCase().includes(q) ||
      String(getUserEmail(item)).toLowerCase().includes(q) ||
      String(getUserName(item)).toLowerCase().includes(q)
    );
  }, [data, searchTx]);

  const getStatusBadge = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "success":
      case "paid":
      case "completed":
        return <Badge bg="success">{paymentStatus}</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark">{paymentStatus}</Badge>;
      case "failed":
        return <Badge bg="danger">{paymentStatus}</Badge>;
      case "refunded":
        return <Badge bg="info">{paymentStatus}</Badge>;
      default:
        return <Badge bg="secondary">{paymentStatus || "—"}</Badge>;
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
            <h4 className="main-title mb-0 admin-page-title">Payment History</h4>
            <p className="text-secondary small mb-0 mt-1">
              {totalRecords > 0 ? `${totalRecords} payment record(s)` : "Customer payment transactions"}
            </p>
          </div>
          <Button variant="primary" onClick={fetchData} disabled={loading} className="mt-3 mt-md-0">
            <i className={`ri-refresh-line me-1 ${loading ? "spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
              <Form.Select
                className="w-auto"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Form.Select>
              <Form.Control
                type="search"
                className="w-auto"
                style={{ minWidth: "260px" }}
                placeholder="Search transaction, order, user…"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
              />
            </div>

            {loading ? (
              <DataTableSkeleton rows={6} columns={8} />
            ) : (
              <div className="table-responsive">
                <Table className="table-hover mb-0" hover>
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
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.length > 0 ? (
                      displayData.map((item, index) => (
                        <tr key={item._id || item.id || index}>
                          <td>{searchTx ? index + 1 : (page - 1) * limit + index + 1}</td>
                          <td className="small fw-medium">{getTransactionId(item)}</td>
                          <td>
                            <div>{getUserName(item)}</div>
                            <div className="text-muted small">{getUserEmail(item)}</div>
                          </td>
                          <td className="small">{getOrderRef(item)}</td>
                          <td className="small fw-medium">{formatAmount(item)}</td>
                          <td className="small">{getPaymentMethod(item)}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td className="small">
                            {item.createdAt
                              ? moment(item.createdAt).format("DD MMM YYYY, hh:mm A")
                              : "—"}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => setSelected(item)}
                              title="View details"
                            >
                              <i className="ri-eye-line" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-0 border-0">
                          <AdminEmptyState
                            icon="ri-money-dollar-circle-line"
                            title="No payment history found"
                            description="Payments will appear here once customers complete checkout."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}

            {!searchTx && totalPages > 1 && (
              <div className="d-flex justify-content-end mt-3">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === page}
                      onClick={() => handlePageChange(i + 1)}
                    >
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

        <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Payment Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selected && (
              <Table bordered responsive className="mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: "200px" }}>Transaction ID</th>
                    <td>{getTransactionId(selected)}</td>
                  </tr>
                  <tr>
                    <th>User</th>
                    <td>
                      {getUserName(selected)}
                      {getUserEmail(selected) !== "—" && (
                        <div className="text-muted small">{getUserEmail(selected)}</div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Order</th>
                    <td>{getOrderRef(selected)}</td>
                  </tr>
                  <tr>
                    <th>Amount</th>
                    <td>{formatAmount(selected)}</td>
                  </tr>
                  <tr>
                    <th>Payment method</th>
                    <td>{getPaymentMethod(selected)}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{getStatusBadge(selected.status)}</td>
                  </tr>
                  <tr>
                    <th>Date</th>
                    <td>
                      {selected.createdAt
                        ? moment(selected.createdAt).format("DD MMM YYYY, hh:mm A")
                        : "—"}
                    </td>
                  </tr>
                  <tr>
                    <th>Payment ID</th>
                    <td><code className="small">{selected._id || selected.id || "—"}</code></td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}

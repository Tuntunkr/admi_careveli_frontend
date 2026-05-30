import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import moment from "moment";
import { toast } from "react-toastify";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import DataTableSkeleton from "../../components/DataTableSkeleton";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import { getAffiliateUsers, updateAffiliateStatus } from "../../helper/affiliate_helper";
import { dataTableCustomStyles, dataTablePaginationOptions } from "../../components/admin/dataTableConfig";

const safeText = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getInitials = (name) => {
  if (!name || name === "—") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getName = (row) =>
  row?.name ||
  row?.fullName ||
  row?.userName ||
  row?.user?.name ||
  row?.affiliateUser?.name ||
  "—";

const getEmail = (row) =>
  row?.email ||
  row?.userEmail ||
  row?.user?.email ||
  row?.affiliateUser?.email ||
  "—";

const getPhone = (row) =>
  row?.phone ||
  row?.mobile ||
  row?.phoneNumber ||
  row?.user?.phone ||
  row?.affiliateUser?.phone ||
  "—";

const getReferralCode = (row) =>
  row?.referralCode ||
  row?.affiliateCode ||
  row?.code ||
  row?.marketingLink?.referralCode ||
  "—";

const getChannel = (row) => row?.channel ?? null;

const getAudience = (row) => row?.audience ?? null;

const getCommissionRate = (row) =>
  row?.commissionRate ??
  row?.commission ??
  row?.commissionPercentage ??
  row?.payoutRate ??
  null;

const getTotalEarnings = (row) =>
  row?.totalEarnings ??
  row?.totalCommission ??
  row?.earnings ??
  row?.stats?.totalEarnings ??
  null;

const getReferralCount = (row) =>
  row?.totalReferrals ??
  row?.referralCount ??
  row?.referrals ??
  row?.stats?.referrals ??
  null;

const getJoinDate = (row) => {
  const value = row?.createdAt || row?.joinedAt || row?.date;
  if (!value) return null;
  const d = moment(value);
  return d.isValid() ? d : null;
};

const AFFILIATE_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const getAffiliateId = (row) => row?._id || row?.id || row?.affiliateId || null;

const getStatus = (row) => {
  if (typeof row?.isActive === "boolean") return row.isActive ? "active" : "inactive";
  if (typeof row?.status === "string") return row.status.toLowerCase();
  if (typeof row?.state === "string") return row.state.toLowerCase();
  return "unknown";
};

const isKnownAffiliateStatus = (status) =>
  AFFILIATE_STATUSES.some((item) => item.value === status);

const normalizeAffiliateList = (res) => {
  if (Array.isArray(res)) return res;

  const candidates = [
    res?.data?.affiliates,
    res?.data?.users,
    res?.data?.list,
    res?.data?.items,
    res?.data,
    res?.affiliates,
    res?.users,
    res?.list,
  ];

  const firstArray = candidates.find((item) => Array.isArray(item));
  return firstArray || [];
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  if (Number.isNaN(num)) return safeText(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(num);
};

function DetailField({ label, value, children }) {
  return (
    <Col md={6}>
      <small className="text-muted d-block mb-1">{label}</small>
      {children || <span className="fw-medium">{safeText(value)}</span>}
    </Col>
  );
}

function AffiliateDetailsContent({ affiliate }) {
  if (!affiliate) return null;

  const name = getName(affiliate);
  const email = getEmail(affiliate);
  const phone = getPhone(affiliate);
  const status = getStatus(affiliate);
  const joinDate = getJoinDate(affiliate);
  const bankDetails =
    affiliate?.bankDetails ||
    affiliate?.bankAccount ||
    affiliate?.payoutDetails ||
    affiliate?.paymentInfo ||
    null;

  const extraEntries = Object.entries(affiliate).filter(([key, value]) => {
    if (["_id", "id", "__v"].includes(key)) return false;
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "object") return false;
    const covered = [
      "name", "fullName", "userName", "email", "userEmail", "phone", "mobile",
      "phoneNumber", "referralCode", "affiliateCode", "code", "channel", "audience",
      "commissionRate",
      "commission", "commissionPercentage", "totalEarnings", "totalCommission",
      "earnings", "totalReferrals", "referralCount", "referrals", "isActive",
      "status", "state", "createdAt", "joinedAt", "date", "updatedAt",
    ];
    return !covered.includes(key);
  });

  return (
    <div className="user-details-modal">
      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
        <span className="user-avatar-initials" style={{ width: 48, height: 48, fontSize: "1rem" }}>
          {getInitials(name)}
        </span>
        <div>
          <h5 className="mb-1 fw-bold">{name}</h5>
          <div className="d-flex flex-wrap gap-2">
            <Badge bg={status === "active" ? "success" : status === "inactive" ? "secondary" : "warning"}>
              {status}
            </Badge>
            <Badge bg="light" text="dark" className="border">
              {getReferralCode(affiliate)}
            </Badge>
          </div>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <DetailField label="Affiliate ID" value={affiliate._id || affiliate.id} />
        <DetailField label="Full name" value={name} />
        <DetailField label="Email">
          {email !== "—" ? <a href={`mailto:${email}`} className="text-break">{email}</a> : "—"}
        </DetailField>
        <DetailField label="Phone" value={phone} />
        <DetailField label="Referral code" value={getReferralCode(affiliate)} />
        <DetailField label="Channel" value={getChannel(affiliate)} />
        <DetailField label="Audience" value={getAudience(affiliate)} />
        <DetailField
          label="Commission rate"
          value={
            getCommissionRate(affiliate) !== null
              ? `${getCommissionRate(affiliate)}%`
              : "—"
          }
        />
        <DetailField label="Total earnings" value={formatCurrency(getTotalEarnings(affiliate))} />
        <DetailField label="Total referrals" value={getReferralCount(affiliate)} />
        <DetailField
          label="Joined"
          value={joinDate ? joinDate.format("DD MMM YYYY, hh:mm A") : "—"}
        />
        <DetailField
          label="Last updated"
          value={
            affiliate.updatedAt
              ? moment(affiliate.updatedAt).format("DD MMM YYYY, hh:mm A")
              : "—"
          }
        />
      </Row>

      {bankDetails && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">
            <i className="ri-bank-line me-1" />
            Payout details
          </h6>
          <div className="bg-light rounded p-3 small">
            {typeof bankDetails === "object" ? (
              Object.entries(bankDetails).map(([key, value]) => (
                <div key={key} className="d-flex justify-content-between gap-3 mb-2">
                  <span className="text-muted text-capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="fw-medium text-end">{safeText(value)}</span>
                </div>
              ))
            ) : (
              safeText(bankDetails)
            )}
          </div>
        </div>
      )}

      {affiliate?.referrals?.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">
            <i className="ri-share-forward-line me-1" />
            Referrals
          </h6>
          <div className="table-responsive">
            <Table size="sm" bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {affiliate.referrals.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="small">{item.name || item.email || "—"}</td>
                    <td className="small">
                      {item.createdAt ? moment(item.createdAt).format("DD MMM YYYY") : "—"}
                    </td>
                    <td className="small">{safeText(item.status || item.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {extraEntries.length > 0 && (
        <div>
          <h6 className="fw-semibold mb-2">
            <i className="ri-information-line me-1" />
            Additional info
          </h6>
          <div className="table-responsive">
            <Table size="sm" bordered className="mb-0">
              <tbody>
                {extraEntries.map(([key, value]) => (
                  <tr key={key}>
                    <th style={{ width: "220px" }} className="text-capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </th>
                    <td className="small">{safeText(value)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AffiliateUsers() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);

  const applyStatusToRow = (row, nextStatus) => ({
    ...row,
    status: nextStatus,
    isActive: nextStatus === "active",
  });

  const handleConfirmStatusUpdate = async () => {
    if (!statusConfirm) return;

    const affiliateId = getAffiliateId(statusConfirm.row);
    const { nextStatus } = statusConfirm;

    if (!affiliateId) {
      toast.error("Affiliate ID not found");
      setStatusConfirm(null);
      return;
    }

    setStatusUpdatingId(affiliateId);
    try {
      const res = await updateAffiliateStatus(affiliateId, nextStatus);

      if (res?.success === false) {
        toast.error(res?.message || "Failed to update affiliate status");
        return;
      }

      toast.success(res?.message || "Affiliate status updated successfully");

      setRows((prev) =>
        prev.map((row) =>
          getAffiliateId(row) === affiliateId ? applyStatusToRow(row, nextStatus) : row
        )
      );

      if (selected && getAffiliateId(selected) === affiliateId) {
        setSelected(applyStatusToRow(selected, nextStatus));
      }
    } catch (error) {
      console.error("Failed to update affiliate status:", error);
      toast.error(error?.message || "Failed to update affiliate status");
    } finally {
      setStatusUpdatingId(null);
      setStatusConfirm(null);
    }
  };

  const requestStatusChange = (row, nextStatus) => {
    const currentStatus = getStatus(row);
    if (!nextStatus || nextStatus === currentStatus) return;
    setStatusConfirm({ row, nextStatus, currentStatus });
  };

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const res = await getAffiliateUsers();
      const list = normalizeAffiliateList(res);

      if (res?.success === false && !list.length) {
        toast.error(res?.message || "Failed to load affiliate users");
        setRows([]);
        return;
      }

      setRows(list);
      if (!list.length && res?.message) {
        toast.info(res.message);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate users:", error);
      toast.error("Failed to load affiliate users");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const status = getStatus(row);
      const statusMatch = !statusFilter || status === statusFilter;
      if (!statusMatch) return false;
      if (!q) return true;

      return (
        getName(row).toLowerCase().includes(q) ||
        getEmail(row).toLowerCase().includes(q) ||
        getPhone(row).toLowerCase().includes(q) ||
        getReferralCode(row).toLowerCase().includes(q) ||
        safeText(getChannel(row)).toLowerCase().includes(q) ||
        safeText(getAudience(row)).toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const summary = useMemo(() => {
    const active = rows.filter((row) => getStatus(row) === "active").length;
    const totalReferrals = rows.reduce((sum, row) => sum + (Number(getReferralCount(row)) || 0), 0);
    const totalEarnings = rows.reduce((sum, row) => sum + (Number(getTotalEarnings(row)) || 0), 0);
    return { total: rows.length, active, totalReferrals, totalEarnings };
  }, [rows]);

  const columns = [
    {
      name: "Name",
      selector: (row) => getName(row),
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <span className="user-avatar-initials" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>
            {getInitials(getName(row))}
          </span>
          <span className="fw-medium">{getName(row)}</span>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => getEmail(row),
      sortable: true,
      minWidth: "220px",
      wrap: true,
      cell: (row) => <span className="text-break small">{getEmail(row)}</span>,
    },
    {
      name: "Phone",
      selector: (row) => getPhone(row),
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Referral Code",
      selector: (row) => getReferralCode(row),
      sortable: true,
      minWidth: "150px",
      cell: (row) => (
        <Badge bg="light" text="dark" className="border">
          {getReferralCode(row)}
        </Badge>
      ),
    },
    {
      name: "Channel",
      selector: (row) => safeText(getChannel(row)),
      sortable: true,
      minWidth: "130px",
      cell: (row) => <span className="small">{safeText(getChannel(row))}</span>,
    },
    {
      name: "Audience",
      selector: (row) => safeText(getAudience(row)),
      sortable: true,
      minWidth: "130px",
      cell: (row) => <span className="small">{safeText(getAudience(row))}</span>,
    },
    {
      name: "Referrals",
      selector: (row) => getReferralCount(row) ?? 0,
      sortable: true,
      minWidth: "110px",
      center: true,
    },
    {
      name: "Earnings",
      selector: (row) => getTotalEarnings(row) ?? 0,
      sortable: true,
      minWidth: "120px",
      cell: (row) => <span className="small">{formatCurrency(getTotalEarnings(row))}</span>,
    },
    {
      name: "Status",
      selector: (row) => getStatus(row),
      sortable: true,
      minWidth: "140px",
      cell: (row) => {
        const affiliateId = getAffiliateId(row);
        const status = getStatus(row);
        const selectValue = isKnownAffiliateStatus(status) ? status : "inactive";
        const isUpdating = statusUpdatingId === affiliateId;

        return (
          <Form.Select
            size="sm"
            value={selectValue}
            disabled={isUpdating || !affiliateId}
            onChange={(e) => requestStatusChange(row, e.target.value)}
            style={{ minWidth: "120px" }}
            title="Update affiliate status"
          >
            {AFFILIATE_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Form.Select>
        );
      },
    },
    {
      name: "Joined",
      selector: (row) => (getJoinDate(row) ? getJoinDate(row).valueOf() : 0),
      sortable: true,
      minWidth: "120px",
      cell: (row) => {
        const date = getJoinDate(row);
        return date ? date.format("DD MMM YYYY") : "—";
      },
    },
    {
      name: "Action",
      center: true,
      minWidth: "100px",
      ignoreRowClick: true,
      cell: (row) => (
        <Button size="sm" variant="outline-dark" onClick={() => setSelected(row)} title="View details">
          <i className="ri-eye-line" />
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Affiliate Users</li>
            </ol>
            <p className="text-muted small mb-0">
              Manage affiliate partners, referrals, and commission activity
            </p>
          </div>
          <Button variant="primary" onClick={fetchAffiliates} disabled={loading} className="mt-3 mt-md-0">
            <i className={`ri-refresh-line me-1 ${loading ? "spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="py-3">
                <small className="text-muted d-block">Total Affiliates</small>
                <h4 className="mb-0 fw-bold">{summary.total}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="py-3">
                <small className="text-muted d-block">Active</small>
                <h4 className="mb-0 fw-bold text-success">{summary.active}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="py-3">
                <small className="text-muted d-block">Total Referrals</small>
                <h4 className="mb-0 fw-bold">{summary.totalReferrals}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="py-3">
                <small className="text-muted d-block">Total Earnings</small>
                <h4 className="mb-0 fw-bold">{formatCurrency(summary.totalEarnings)}</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
              <Form.Control
                type="search"
                style={{ minWidth: "240px", maxWidth: "420px" }}
                placeholder="Search name, email, phone, code, channel, audience..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Form.Select
                className="w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </div>

            {loading ? (
              <DataTableSkeleton rows={6} columns={11} />
            ) : filteredRows.length ? (
              <div className="admin-datatable-scroll">
                <DataTable
                  columns={columns}
                  data={filteredRows}
                  pagination
                  paginationPerPage={perPage}
                  onChangeRowsPerPage={(newPerPage, currentPage) => {
                    setPerPage(newPerPage);
                    setPage(currentPage);
                  }}
                  onChangePage={(newPage) => setPage(newPage)}
                  paginationDefaultPage={page}
                  paginationComponentOptions={dataTablePaginationOptions}
                  customStyles={dataTableCustomStyles}
                  striped
                  highlightOnHover
                />
              </div>
            ) : (
              <AdminEmptyState
                icon="ri-user-star-line"
                title="No affiliate users found"
                description="Affiliate registrations will appear here once users sign up."
              />
            )}
          </Card.Body>
        </Card>

        <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Affiliate User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AffiliateDetailsContent affiliate={selected} />
          </Modal.Body>
          <Modal.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Status</span>
              <Form.Select
                size="sm"
                style={{ width: "auto", minWidth: "130px" }}
                value={
                  selected && isKnownAffiliateStatus(getStatus(selected))
                    ? getStatus(selected)
                    : "inactive"
                }
                disabled={
                  !selected ||
                  statusUpdatingId === getAffiliateId(selected) ||
                  !getAffiliateId(selected)
                }
                onChange={(e) => requestStatusChange(selected, e.target.value)}
              >
                {AFFILIATE_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <Button variant="outline-secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={Boolean(statusConfirm)}
          onHide={() => !statusUpdatingId && setStatusConfirm(null)}
          centered
        >
          <Modal.Header closeButton={!statusUpdatingId}>
            <Modal.Title>Update affiliate status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {statusConfirm && (
              <p className="mb-0">
                Change status for <strong>{getName(statusConfirm.row)}</strong> from{" "}
                <Badge bg="secondary" className="text-capitalize">
                  {statusConfirm.currentStatus}
                </Badge>{" "}
                to{" "}
                <Badge
                  bg={statusConfirm.nextStatus === "active" ? "success" : "secondary"}
                  className="text-capitalize"
                >
                  {statusConfirm.nextStatus}
                </Badge>
                ?
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setStatusConfirm(null)}
              disabled={Boolean(statusUpdatingId)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmStatusUpdate}
              disabled={Boolean(statusUpdatingId)}
            >
              {statusUpdatingId ? "Updating…" : "Confirm"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}

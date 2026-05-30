import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Badge, Card, Modal, Row, Col, Table, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { AvForm, AvField } from "availity-reactstrap-validation";
import moment from "moment";
import { toast } from "react-toastify";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import DataTableSkeleton from "../../components/DataTableSkeleton";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminAddButton from "../../components/admin/AdminAddButton";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getMarketingLinks,
  getMarketingLinkDetails,
  createMarketingLink,
  updateMarketingLink,
  deleteMarketingLink,
  trackReferralClick,
  normalizeMarketingLinksList,
  normalizeMarketingLinkPagination,
  normalizeMarketingLinkDetail,
} from "../../helper/marketing_link_helper";
import { dataTableCustomStyles, dataTablePaginationOptions } from "../../components/admin/dataTableConfig";
import * as Utils from "../../Utils";

const safeText = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const getLinkId = (row) => row?._id || row?.id || null;

const getTrackingCode = (row) =>
  row?.referralCode || row?.trackingCode || row?.code || "";

const getReferralLink = (row) =>
  row?.referralLink || row?.fullLink || row?.link || "";

const buildPayloadFromForm = (v, isEdit) => {
  const payload = {
    referralCode: String(v.referralCode || "").trim().toUpperCase(),
    baseUrl: v.baseUrl ? String(v.baseUrl).trim() : undefined,
    channel: v.channel ? String(v.channel).trim() : null,
    audience: v.audience ? String(v.audience).trim() : null,
  };

  if (v.status) payload.status = v.status;
  if (typeof v.isActive === "boolean") payload.isActive = v.isActive;

  if (!payload.baseUrl) delete payload.baseUrl;
  if (!isEdit && !payload.status) payload.status = "active";

  return payload;
};

function MarketingLinkDetails({ link, loading }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" />
        <p className="text-muted small mt-2 mb-0">Loading details…</p>
      </div>
    );
  }

  if (!link) return <p className="text-muted mb-0">No details available.</p>;

  return (
    <Table bordered responsive className="mb-0">
      <tbody>
        <tr><th style={{ width: "200px" }}>Referral code</th><td><strong>{getTrackingCode(link)}</strong></td></tr>
        <tr><th>Referral link</th><td className="text-break">{safeText(getReferralLink(link))}</td></tr>
        <tr><th>Base URL</th><td className="text-break">{safeText(link.baseUrl)}</td></tr>
        <tr><th>Channel</th><td>{safeText(link.channel)}</td></tr>
        <tr><th>Audience</th><td>{safeText(link.audience)}</td></tr>
        <tr><th>Total clicks</th><td>{link.totalClicks ?? link.clicks ?? 0}</td></tr>
        <tr>
          <th>Status</th>
          <td>
            <Badge bg={link.isActive !== false ? "success" : "secondary"}>
              {link.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </td>
        </tr>
        <tr>
          <th>Created</th>
          <td>{link.createdAt ? moment(link.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{link.updatedAt ? moment(link.updatedAt).format("DD MMM YYYY, hh:mm A") : "—"}</td>
        </tr>
        <tr><th>ID</th><td><code className="small">{safeText(getLinkId(link))}</code></td></tr>
      </tbody>
    </Table>
  );
}

export default function MarketingLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editLink, setEditLink] = useState(null);

  const [viewLink, setViewLink] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [confirm, setConfirm] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await getMarketingLinks(params);
      const list = normalizeMarketingLinksList(res);
      const pagination = normalizeMarketingLinkPagination(res);

      if (res?.success === false && !list.length) {
        toast.error(res?.message || "Failed to load marketing links");
        setLinks([]);
        setTotalPages(1);
        setTotalRows(0);
        return;
      }

      setLinks(list);
      setTotalPages(Math.max(pagination.pages, 1));
      setTotalRows(pagination.total || list.length);
    } catch (error) {
      console.error("Failed to fetch marketing links:", error);
      toast.error(error?.message || "Failed to load marketing links");
      setLinks([]);
      setTotalPages(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLinks();
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setIsEdit(false);
    setEditLink(null);
  };

  const handleShowFormModal = (link = null) => {
    if (link) {
      setEditLink(link);
      setIsEdit(true);
    } else {
      setEditLink(null);
      setIsEdit(false);
    }
    setShowFormModal(true);
  };

  const handleViewDetails = async (link) => {
    const id = getLinkId(link);
    if (!id) {
      toast.error("Link ID not found");
      return;
    }

    setViewLink(link);
    setViewLoading(true);
    try {
      const res = await getMarketingLinkDetails(id);
      const detail = normalizeMarketingLinkDetail(res);
      if (detail && typeof detail === "object") {
        setViewLink(detail);
      }
    } catch (error) {
      console.error("Failed to load link details:", error);
      toast.error(error?.message || "Failed to load link details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleValidSubmit = async (e, v) => {
    setSubmitting(true);
    try {
      const payload = buildPayloadFromForm(v, isEdit);
      let res;

      if (isEdit) {
        const id = getLinkId(editLink);
        if (!id) throw new Error("Link ID not found");
        res = await updateMarketingLink(id, payload);
      } else {
        res = await createMarketingLink(payload);
      }

      if (res?.success === false) {
        toast.error(res?.message || "Failed to save marketing link");
        return;
      }

      toast.success(res?.message || (isEdit ? "Marketing link updated" : "Marketing link created"));
      handleCloseFormModal();
      fetchLinks();
    } catch (error) {
      console.error("Error saving marketing link:", error);
      toast.error(error?.message || "Failed to save marketing link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = (link) => {
    setCurrentData({
      _id: getLinkId(link),
      actionType: "ToggleStatus",
      isActive: link.isActive !== false,
      referralCode: getTrackingCode(link),
      baseUrl: link.baseUrl || "",
      channel: link.channel,
      audience: link.audience,
    });
    setConfirm(true);
  };

  const handleDeleteClick = (link) => {
    setCurrentData({
      _id: getLinkId(link),
      actionType: "Delete",
      referralCode: getTrackingCode(link),
    });
    setConfirm(true);
  };

  const handleTrackClick = async (link) => {
    const code = getTrackingCode(link);
    if (!code) {
      toast.error("Tracking code not found");
      return;
    }

    try {
      const res = await trackReferralClick(code);
      toast.success(res?.message || `Click tracked for ${code}`);
      fetchLinks();
    } catch (error) {
      console.error("Track click failed:", error);
      toast.error(error?.message || "Failed to track click");
    }
  };

  const handleConfirm = async () => {
    if (!currentData?._id) return;

    setActionLoading(true);
    try {
      let res;

      if (currentData.actionType === "Delete") {
        res = await deleteMarketingLink(currentData._id);
      } else if (currentData.actionType === "ToggleStatus") {
        const nextActive = !currentData.isActive;
        res = await updateMarketingLink(currentData._id, {
          referralCode: currentData.referralCode,
          baseUrl: currentData.baseUrl || undefined,
          channel: currentData.channel ?? null,
          audience: currentData.audience ?? null,
          isActive: nextActive,
          status: nextActive ? "active" : "inactive",
        });
      }

      if (res?.success === false) {
        toast.error(res?.message || "Action failed");
        return;
      }

      toast.success(
        res?.message ||
          (currentData.actionType === "Delete" ? "Marketing link deleted" : "Status updated")
      );
      setConfirm(false);
      setCurrentData(null);
      fetchLinks();
    } catch (error) {
      console.error("Action failed:", error);
      toast.error(error?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      name: "Code",
      selector: (row) => getTrackingCode(row),
      sortable: true,
      minWidth: "140px",
      cell: (row) => <strong>{getTrackingCode(row)}</strong>,
    },
    {
      name: "Link",
      selector: (row) => getReferralLink(row),
      minWidth: "220px",
      wrap: true,
      cell: (row) => {
        const url = getReferralLink(row);
        if (!url || url === "—") return "—";
        return (
          <div className="d-flex align-items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-truncate small"
              style={{ maxWidth: "160px" }}
              title={url}
            >
              {url}
            </a>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0 px-1"
              title="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }}
            >
              <i className="ri-file-copy-line" />
            </button>
          </div>
        );
      },
    },
    {
      name: "Channel",
      selector: (row) => safeText(row.channel),
      sortable: true,
      minWidth: "120px",
      cell: (row) => <span className="small">{safeText(row.channel)}</span>,
    },
    {
      name: "Audience",
      selector: (row) => safeText(row.audience),
      sortable: true,
      minWidth: "120px",
      cell: (row) => <span className="small">{safeText(row.audience)}</span>,
    },
    {
      name: "Base URL",
      selector: (row) => row.baseUrl || "",
      sortable: true,
      minWidth: "150px",
      wrap: true,
      cell: (row) => <span className="small text-break">{safeText(row.baseUrl)}</span>,
    },
    {
      name: "Clicks",
      selector: (row) => row.totalClicks ?? row.clicks ?? 0,
      sortable: true,
      minWidth: "90px",
      center: true,
    },
    {
      name: "Created",
      selector: (row) => (row.createdAt ? new Date(row.createdAt).getTime() : 0),
      sortable: true,
      minWidth: "120px",
      cell: (row) =>
        row.createdAt ? moment(row.createdAt).format("DD MMM YYYY") : "—",
    },
    {
      name: "Status",
      minWidth: "110px",
      cell: (row) => (
        <Button
          onClick={() => handleStatusToggle(row)}
          title={row.isActive !== false ? "Active" : "Inactive"}
          className={`btn_status ${row.isActive !== false ? "active" : ""}`}
          size="sm"
        >
          <span className="text-white">
            {row.isActive !== false ? "Active" : "Inactive"}
          </span>
        </Button>
      ),
      ignoreRowClick: true,
    },
    {
      name: "Actions",
      minWidth: "150px",
      center: true,
      cell: (row) => (
        <div className="d-flex gap-1 justify-content-center">
          <Button
            size="sm"
            variant="outline-dark"
            onClick={() => handleViewDetails(row)}
            title="View details"
          >
            <i className="ri-eye-line" />
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleTrackClick(row)}
            title="Track click (API test)"
          >
            <i className="ri-links-line" />
          </Button>
          <Button
            size="sm"
            variant="dark"
            onClick={() => handleShowFormModal(row)}
            title="Edit"
            style={{ border: "none" }}
          >
            <i className="ri-edit-fill" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(row)}
            title="Delete"
            style={{ border: "none" }}
          >
            <i className="ri-delete-bin-6-line" />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
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
              <li className="breadcrumb-item active" aria-current="page">Marketing Links</li>
            </ol>
            <h4 className="main-title mb-0 admin-page-title">Marketing Links</h4>
            <p className="text-secondary small mb-0 mt-1">
              Affiliate and referral link management
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <Button variant="outline-secondary" onClick={fetchLinks} disabled={loading}>
              <i className={`ri-refresh-line me-1 ${loading ? "spin" : ""}`} />
              Refresh
            </Button>
            <AdminAddButton label="Add Link" onClick={() => handleShowFormModal()} />
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Form onSubmit={handleSearchSubmit} className="d-flex flex-wrap gap-2 mb-3">
              <Form.Control
                type="search"
                placeholder="Search by referral code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: "220px", maxWidth: "360px" }}
              />
              <Form.Select
                className="w-auto"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
              <Button type="submit" variant="primary" disabled={loading}>
                Search
              </Button>
            </Form>

            <div className="admin-datatable-scroll">
              <DataTable
                columns={columns}
                data={links}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationDefaultPage={page}
                onChangePage={(newPage) => setPage(newPage)}
                paginationPerPage={perPage}
                paginationComponentOptions={dataTablePaginationOptions}
                progressPending={loading}
                progressComponent={<DataTableSkeleton rows={6} columns={8} />}
                customStyles={dataTableCustomStyles}
                striped
                highlightOnHover
                noDataComponent={
                  <AdminEmptyState
                    icon="ri-links-line"
                    title="No marketing links found"
                    description="Create a referral link to start tracking affiliate traffic."
                  />
                }
              />
            </div>
          </Card.Body>
        </Card>

        <Modal show={showFormModal} onHide={handleCloseFormModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Marketing Link" : "Add Marketing Link"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AvForm onValidSubmit={handleValidSubmit}>
              <AvField
                name="referralCode"
                label="Referral Code *"
                value={editLink?.referralCode || editLink?.trackingCode || ""}
                type="text"
                placeholder="e.g. DEMO-CAREVELI"
                required
                disabled={submitting}
                style={{ textTransform: "uppercase" }}
              />
              <AvField
                name="baseUrl"
                label="Base URL (optional)"
                value={editLink?.baseUrl || ""}
                type="url"
                placeholder="e.g. https://www.careveli.com"
                disabled={submitting}
              />
              <AvField
                name="channel"
                label="Channel"
                value={editLink?.channel || ""}
                type="text"
                placeholder="e.g. Instagram, YouTube"
                disabled={submitting}
              />
              <AvField
                name="audience"
                label="Audience"
                value={editLink?.audience || ""}
                type="text"
                placeholder="e.g. Beauty, Skincare"
                disabled={submitting}
              />
              {isEdit && (
                <AvField
                  name="status"
                  label="Status"
                  type="select"
                  value={editLink?.isActive !== false ? "active" : "inactive"}
                  disabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </AvField>
              )}
              <div className="d-flex gap-2 justify-content-end mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={handleCloseFormModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  style={{ backgroundColor: Utils.themeColor, border: "none" }}
                >
                  {submitting ? "Saving…" : isEdit ? "Update" : "Create"}
                </Button>
              </div>
            </AvForm>
          </Modal.Body>
        </Modal>

        <Modal show={Boolean(viewLink)} onHide={() => setViewLink(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Marketing Link Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <MarketingLinkDetails link={viewLink} loading={viewLoading} />
          </Modal.Body>
          <Modal.Footer>
            {viewLink && getTrackingCode(viewLink) && (
              <Button
                variant="outline-primary"
                disabled={viewLoading}
                onClick={() => handleTrackClick(viewLink)}
              >
                <i className="ri-links-line me-1" />
                Test track API
              </Button>
            )}
            <Button variant="outline-secondary" onClick={() => setViewLink(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <ConfirmModal
          show={confirm}
          onCloseClick={() => {
            if (!actionLoading) {
              setConfirm(false);
              setCurrentData(null);
            }
          }}
          onConfirm={handleConfirm}
          data={currentData}
        />

        <Footer />
      </div>
    </React.Fragment>
  );
}

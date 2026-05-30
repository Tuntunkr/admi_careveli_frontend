import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalBody, ModalHeader, ModalFooter, Label } from "reactstrap";
import { Button, Table } from "react-bootstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import DataTableSkeleton from "../../components/DataTableSkeleton";
import ConfirmModal from "../../components/ConfirmModal";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import { dataTableCustomStyles, dataTablePaginationOptions } from "../../components/admin/dataTableConfig";
import {
  getAdminSpotlightList,
  getSpotlightById,
  addSpotlight,
  updateSpotlight,
  deleteSpotlight,
  toggleSpotlightStatus,
  normalizeSpotlightList,
  normalizeSpotlightDetail,
  isSpotlightApiSuccess,
  getSpotlightVideoUrl,
} from "../../helper/spotlight_helper";
import moment from "moment";

function SpotlightManagement() {
  const userState = useSelector((state) => state.user);
  const user = userState?.user || userState;
  const token = user?.token || localStorage.getItem("adminToken");

  const [isAdd, setIsAdd] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [file, setFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadRequestRef = useRef(0);
  const authErrorShownRef = useRef(false);

  const fetchSpotlights = useCallback(async () => {
    if (!token) return;

    const requestId = ++loadRequestRef.current;
    setListLoading(true);

    try {
      const res = await getAdminSpotlightList();
      if (requestId !== loadRequestRef.current) return;

      if (isSpotlightApiSuccess(res)) {
        setData(normalizeSpotlightList(res));
      } else {
        setData([]);
        toast.error(res?.message || res?.error || "Failed to fetch spotlights");
      }
    } catch (err) {
      if (requestId !== loadRequestRef.current) return;
      console.error("Error fetching spotlights:", err);
      setData([]);
      toast.error(err?.message || "Failed to load spotlights");
    } finally {
      if (requestId === loadRequestRef.current) {
        setListLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (!authErrorShownRef.current) {
        authErrorShownRef.current = true;
        toast.error("No authentication token found. Please login again.");
      }
      return;
    }
    fetchSpotlights();
    return () => {
      loadRequestRef.current += 1;
    };
  }, [token, fetchSpotlights]);

  useEffect(() => {
    if (!isAdd) {
      setFile(null);
      if (videoPreview && videoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      if (!viewItem) setCurrentData(null);
    }
  }, [isAdd, videoPreview, viewItem]);

  const resetFormModal = () => {
    setIsAdd(false);
    setFile(null);
    setCurrentData(null);
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  const openAddModal = () => {
    setCurrentData(null);
    setFile(null);
    setVideoPreview(null);
    setIsAdd(true);
  };

  const handleViewSpotlight = async (row) => {
    const id = row?._id || row?.id;
    if (!id) {
      toast.error("Spotlight ID not found");
      return;
    }

    setViewItem(row);
    setViewLoading(true);
    try {
      const res = await getSpotlightById(id);
      if (isSpotlightApiSuccess(res)) {
        setViewItem(normalizeSpotlightDetail(res));
      } else {
        toast.error(res?.message || res?.error || "Failed to load spotlight details");
      }
    } catch (err) {
      console.error("Error loading spotlight:", err);
      toast.error(err?.message || "Failed to load spotlight details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleUpdateSpotlight = async (row) => {
    const id = row?._id || row?.id;
    setCurrentData(row);
    setVideoPreview(getSpotlightVideoUrl(row?.video));
    setIsAdd(true);

    if (!id) return;

    try {
      const res = await getSpotlightById(id);
      if (isSpotlightApiSuccess(res)) {
        const detail = normalizeSpotlightDetail(res);
        setCurrentData(detail);
        setVideoPreview(getSpotlightVideoUrl(detail?.video));
      }
    } catch (err) {
      console.warn("Could not refresh spotlight before edit:", err);
    }
  };

  const handleUpdateStatus = (row) => {
    setCurrentData({ ...row, actionType: "ToggleStatus" });
    setConfirm(true);
  };

  const handleDeleteSpotlight = (row) => {
    setCurrentData({ ...row, actionType: "Delete" });
    setConfirm(true);
  };

  const runToggleStatus = async () => {
    const id = currentData?._id || currentData?.id;
    if (!id) return;

    setActionLoading(true);
    try {
      const res = await toggleSpotlightStatus(id);
      if (isSpotlightApiSuccess(res)) {
        setConfirm(false);
        setCurrentData(null);
        toast.success(res?.message || "Status updated successfully");
        fetchSpotlights();
      } else {
        toast.error(res?.message || res?.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err?.message || "Failed to update spotlight status");
    } finally {
      setActionLoading(false);
    }
  };

  const runDelete = async () => {
    const id = currentData?._id || currentData?.id;
    if (!id) return;

    setActionLoading(true);
    try {
      const res = await deleteSpotlight(id);
      if (isSpotlightApiSuccess(res)) {
        setConfirm(false);
        setCurrentData(null);
        toast.success(res?.message || "Deleted successfully");
        fetchSpotlights();
      } else {
        toast.error(res?.message || res?.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error(err?.message || "Failed to delete spotlight");
    } finally {
      setActionLoading(false);
    }
  };

  const onConfirm = () => {
    if (actionLoading) return;
    if (currentData?.actionType === "Delete") {
      runDelete();
    } else if (currentData?.actionType === "ToggleStatus") {
      runToggleStatus();
    }
  };

  const onSubmit = async (event, values) => {
    if (!file && !currentData) {
      toast.error("Please select a video");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("video", file);
    if (values.title) formData.append("title", values.title);
    if (currentData) {
      formData.append("isActive", values.isActive === "true" || values.isActive === true);
    }

    const id = currentData?._id || currentData?.id;
    setSubmitting(true);

    try {
      const res = currentData && id
        ? await updateSpotlight(id, formData)
        : await addSpotlight(formData);

      if (isSpotlightApiSuccess(res)) {
        toast.success(
          res?.message || `Spotlight ${currentData ? "updated" : "added"} successfully`
        );
        resetFormModal();
        fetchSpotlights();
      } else {
        toast.error(res?.message || res?.error || "Failed to save spotlight");
      }
    } catch (err) {
      console.error("Error saving spotlight:", err);
      toast.error(err?.message || "Failed to save spotlight");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }
    setFile(selectedFile);
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(URL.createObjectURL(selectedFile));
  };

  const columns = useMemo(
    () => [
      {
        name: "Video",
        cell: (row) => {
          const src = getSpotlightVideoUrl(row?.video);
          return src ? (
            <video
              src={src}
              style={{ width: 100, height: 60, padding: 5, objectFit: "cover" }}
              controls
              muted
            />
          ) : (
            <span className="text-muted small">No video</span>
          );
        },
        maxWidth: "200px",
        minWidth: "120px",
        ignoreRowClick: true,
      },
      {
        name: "Title",
        selector: (row) => row?.title || "—",
        sortable: true,
        wrap: true,
        minWidth: "150px",
      },
      {
        name: "Date",
        selector: (row) => (row?.createdAt ? new Date(row.createdAt).getTime() : 0),
        sortable: true,
        minWidth: "130px",
        cell: (row) =>
          row?.createdAt ? moment(row.createdAt).format("DD MMM YYYY") : "—",
      },
      {
        name: "Status",
        maxWidth: "110px",
        ignoreRowClick: true,
        cell: (row) => (
          <Button
            onClick={() => handleUpdateStatus(row)}
            title={row?.isActive ? "Active" : "Inactive"}
            className={`btn_status ${row?.isActive ? "active" : ""}`}
            size="sm"
            disabled={actionLoading}
          >
            <span className="text-white">{row?.isActive ? "Active" : "Inactive"}</span>
          </Button>
        ),
      },
      {
        name: "Actions",
        ignoreRowClick: true,
        minWidth: "160px",
        cell: (row) => (
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="outline-dark"
              onClick={() => handleViewSpotlight(row)}
              title="View details"
            >
              <i className="ri-eye-line" />
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleUpdateSpotlight(row)}
              title="Edit"
              style={{ border: "none" }}
            >
              <i className="ri-edit-fill" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteSpotlight(row)}
              title="Delete"
              style={{ border: "none" }}
              disabled={actionLoading}
            >
              <i className="ri-delete-bin-6-line" />
            </Button>
          </div>
        ),
      },
    ],
    [actionLoading]
  );

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">
                <Link to="/admin/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Spotlight
              </li>
            </ol>
            <h4 className="main-title mb-0 admin-page-title">Spotlight Management</h4>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <Button variant="outline-secondary" onClick={fetchSpotlights} disabled={listLoading}>
              <i className={`ri-refresh-line me-1 ${listLoading ? "spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={openAddModal} variant="primary">
              + Add Spotlight
            </Button>
          </div>
        </div>

        <ConfirmModal
          show={confirm}
          onCloseClick={() => {
            if (!actionLoading) {
              setConfirm(false);
              setCurrentData(null);
            }
          }}
          onConfirm={onConfirm}
          data={currentData}
        />

        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody>
                <CardTitle className="mb-3">Spotlight videos</CardTitle>
                <div className="admin-datatable-scroll">
                  <DataTable
                    progressPending={listLoading}
                    progressComponent={<DataTableSkeleton />}
                    columns={columns}
                    data={data}
                    pagination
                    paginationComponentOptions={dataTablePaginationOptions}
                    customStyles={dataTableCustomStyles}
                    striped
                    highlightOnHover
                    noDataComponent={
                      <AdminEmptyState
                        icon="ri-video-line"
                        title="No spotlights yet"
                        description="Add your first spotlight to feature products on the storefront."
                        actionLabel="Add Spotlight"
                        onAction={openAddModal}
                      />
                    }
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={isAdd} toggle={resetFormModal} size="md" centered>
          <AvForm onValidSubmit={(e, v) => onSubmit(e, v)}>
            <div className="modal-header">
              <h5 className="modal-title">
                {currentData ? "Update Spotlight" : "Add Spotlight"}
              </h5>
              <button type="button" className="btn-close" onClick={resetFormModal} />
            </div>
            <ModalBody>
              <div className="mb-3">
                <Label>Video {!currentData && "*"}</Label>
                <input
                  type="file"
                  accept="video/*"
                  className="form-control"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
                {videoPreview && (
                  <div className="mt-2">
                    <video
                      src={videoPreview}
                      style={{ maxWidth: "100%", maxHeight: 200 }}
                      controls
                    />
                  </div>
                )}
              </div>
              <AvField
                name="title"
                label="Title"
                type="text"
                placeholder="Enter spotlight title"
                value={currentData?.title || ""}
                disabled={submitting}
              />
              {currentData && (
                <AvField
                  name="isActive"
                  label="Status"
                  type="select"
                  value={currentData?.isActive !== false ? "true" : "false"}
                  disabled={submitting}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </AvField>
              )}
            </ModalBody>
            <div className="modal-footer">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={resetFormModal}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </AvForm>
        </Modal>

        <Modal isOpen={Boolean(viewItem)} toggle={() => setViewItem(null)} size="lg" centered>
          <ModalHeader toggle={() => setViewItem(null)}>Spotlight Details</ModalHeader>
          <ModalBody>
            {viewLoading ? (
              <p className="text-muted text-center py-4 mb-0">Loading…</p>
            ) : viewItem ? (
              <>
                {getSpotlightVideoUrl(viewItem.video) && (
                  <video
                    src={getSpotlightVideoUrl(viewItem.video)}
                    style={{ maxWidth: "100%", maxHeight: 280, marginBottom: 16 }}
                    controls
                  />
                )}
                <Table bordered responsive size="sm" className="mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: 140 }}>Title</th>
                      <td>{viewItem.title || "—"}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{viewItem.isActive ? "Active" : "Inactive"}</td>
                    </tr>
                    <tr>
                      <th>Created</th>
                      <td>
                        {viewItem.createdAt
                          ? moment(viewItem.createdAt).format("DD MMM YYYY, hh:mm A")
                          : "—"}
                      </td>
                    </tr>
                    <tr>
                      <th>ID</th>
                      <td>
                        <code className="small">{viewItem._id || viewItem.id || "—"}</code>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setViewItem(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <Footer />
    </React.Fragment>
  );
}

export default SpotlightManagement;

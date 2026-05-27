import React, { useEffect, useState, useCallback, useRef } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalBody, Label } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { del, get, post, put } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { dataTableCustomStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';
import * as Utils from "../../Utils";
import Loader from '../../layouts/Loader';
import moment from 'moment';

function SpotlightManagement() {

    const userState = useSelector(state => state.user);
    // Handle both direct token access and nested user object
    const user = userState?.user || userState;
    const token = user?.token || localStorage.getItem("adminToken");

    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [file, setFile] = useState(null);
    const [video, setVideo] = useState(null);
    const loadRequestRef = useRef(0);
    const authErrorShownRef = useRef(false);

    const fetchSpotlights = useCallback(() => {
        if (!token) return;

        const requestId = ++loadRequestRef.current;
        setLoading(true);

        get("spotlight/admin/list", { token })
            .then(res => {
                if (requestId !== loadRequestRef.current) return;
                setLoading(false);

                const ok = res?.statusCode === 200 || res?.success === true;
                if (ok) {
                    const list = Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.spotlights)
                            ? res.spotlights
                            : [];
                    setData(list);
                    return;
                }

                toast.error(res?.message || res?.error || "Failed to fetch spotlights");
            })
            .catch(err => {
                if (requestId !== loadRequestRef.current) return;
                setLoading(false);
                console.error("Error fetching spotlights:", err);
                toast.error("Failed to load spotlights. Check console for details.");
            });
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
        setColumns([
            {
                name: 'Video',
                cell: (row) => <>
                    {row?.video ? (
                        <video src={row?.video} style={{ width: 100, height: 60, padding: 5, objectFit: 'cover' }} controls muted />
                    ) : (
                        <span>No Video</span>
                    )}
                </>,
                maxWidth: '200px',
                minWidth: '120px'
            },
            {
                name: 'Title',
                selector: row => row?.title || '-',
                sortable: true,
                wrap: true,
                maxWidth: '250px',
                minWidth: '150px'
            },
            {
                name: 'Date',
                selector: row => moment(row?.createdAt).format("DD-MMM-YYYY"),
                sortable: true,
                minWidth: '130px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateStatus(row)}
                        title={row?.isActive ? "Active" : "Inactive"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                    >
                        <span className="text-white">
                            {row?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </Button>
                </>,
                name: 'Status',
                ignoreRowClick: true,
                maxWidth: '110px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateSpotlight(row)}
                        title={"Edit"} variant="primary"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}>
                        <span className="ri-edit-fill" style={{ fontSize: 15 }}></span>
                    </Button>
                    <Button onClick={() => handleDeleteSpotlight(row)}
                        title={"Delete"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}>
                        <span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span>
                    </Button>
                </>,
                name: 'Action',
                ignoreRowClick: true,
                maxWidth: '130px'
            },
        ]);
    }, [data]);

    useEffect(() => {
        if (!isAdd) {
            setFile(null);
            setVideo(null);
            setCurrentData(null);
        }
    }, [isAdd]);

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "ToggleStatus" });
        setConfirm(true);
    }

    const updateSpotlightStatus = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}spotlight/toggle-status/${currentData?._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode === 200) {
                        setConfirm(false);
                        toast.success("Status updated successfully");
                        fetchSpotlights();
                    } else {
                        toast.error(res?.message || res?.error || "Failed to update status");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error updating status:", err);
                    toast.error("Failed to update spotlight status.");
                });
        }
    }

    const handleUpdateSpotlight = (row) => {
        setCurrentData(row);
        setVideo(row?.video);
        setIsAdd(true);
    }

    const handleDeleteSpotlight = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    const onConfirm = () => {
        if (currentData?.actionType === 'Delete') {
            deleteSpotlightAction();
        } else if (currentData?.actionType === 'ToggleStatus') {
            updateSpotlightStatus();
        }
    }

    const deleteSpotlightAction = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}spotlight/delete/${currentData?._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode === 200) {
                        setConfirm(false);
                        toast.success("Deleted successfully");
                        fetchSpotlights();
                    } else {
                        toast.error(res?.message || res?.error || "Failed to delete");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error deleting:", err);
                    toast.error("Failed to delete spotlight.");
                });
        }
    }

    const onSubmit = (event, values) => {
        if (!file && !currentData) {
            toast.error("Please select a video");
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append("video", file);
        }
        if (values.title) formData.append("title", values.title);
        formData.append("isActive", true);

        if (!loading) {
            setLoading(true);
            const url = currentData ? `${Utils.API_URL}spotlight/update/${currentData?._id}` : `${Utils.API_URL}spotlight/add`;
            const method = currentData ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode === 200) {
                        toast.success(`Spotlight ${currentData ? 'updated' : 'added'} successfully`);
                        setIsAdd(false);
                        fetchSpotlights();
                    } else {
                        toast.error(res?.message || res?.error || "Failed to save spotlight");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error saving spotlight:", err);
                    toast.error("Failed to save spotlight.");
                });
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setVideo(URL.createObjectURL(selectedFile));
        }
    }

    return (
        <React.Fragment>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Spotlight Management</li>
                        </ol>
                        <h4 className="main-title mb-0">Spotlight Management</h4>
                    </div>
                </div>

                <ConfirmModal confirm={confirm} setConfirm={setConfirm} onConfirm={onConfirm} />

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <div className='d-flex align-items-center justify-content-between mb-4'>
                                    <CardTitle className="mb-0">Spotlight</CardTitle>
                                    <Button onClick={() => setIsAdd(true)} variant="primary">
                                        + Add Spotlight
                                    </Button>
                                </div>
                                <div className='table-responsive'>
                                    <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                                        columns={columns}
                                        data={data || []}
                                        pagination
                                        paginationComponentOptions={dataTablePaginationOptions}
                                        customStyles={dataTableCustomStyles}
                                        noDataComponent={
                                            <AdminEmptyState
                                                icon="ri-video-line"
                                                title="No spotlights yet"
                                                description="Add your first spotlight to feature products on the storefront."
                                                actionLabel="Add Spotlight"
                                                onAction={() => setIsAdd(true)}
                                            />
                                        }
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Modal isOpen={isAdd} toggle={() => setIsAdd(!isAdd)} size='md'>
                    <AvForm onValidSubmit={(e, v) => onSubmit(e, v)}>
                        <div className="modal-header">
                            <h5 className="modal-title">{currentData ? "Update Spotlight" : "Add Spotlight"}</h5>
                            <button type="button" className="btn-close" onClick={() => setIsAdd(false)}></button>
                        </div>
                        <ModalBody>
                            <Row>
                                <Col lg={12}>
                                    <div className="mb-3">
                                        <Label>Video *</Label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            required={!currentData}
                                        />
                                        {video && (
                                            <div className="mt-2">
                                                <video src={video} style={{ maxWidth: '100%', maxHeight: 200 }} controls />
                                            </div>
                                        )}
                                    </div>
                                    <AvField
                                        name="title"
                                        label="Title"
                                        type="text"
                                        placeholder="Enter spotlight title"
                                        errorMessage="Please enter a valid title"
                                        value={currentData ? currentData?.title : ''}
                                    />
                                </Col>
                            </Row>
                        </ModalBody>
                        <div className="modal-footer">
                            <Button type="button" variant="secondary" onClick={() => setIsAdd(false)}>Close</Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </AvForm>
                </Modal>
            </div>
            <Footer />
        </React.Fragment>
    )
}

export default SpotlightManagement;

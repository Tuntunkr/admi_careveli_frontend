import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Pagination, Badge } from "react-bootstrap";
import { Card as RsCard, CardBody as RsCardBody, CardTitle as RsCardTitle, Row, Col, Modal, ModalBody, Label } from 'reactstrap';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { getMarketingLinks, createMarketingLink, updateMarketingLink, deleteMarketingLink } from "../../helper/marketing_link_helper";
import HeaderMobile from "../../layouts/HeaderMobile";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import ConfirmModal from "../../components/ConfirmModal";
import * as Utils from "../../Utils";
import { toast } from 'react-toastify';
import AdminAddButton from '../../components/admin/AdminAddButton';
import { dataTableCustomStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';

export default function MarketingLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const skin = localStorage.getItem("skin-mode") ? "dark" : "";
    const [onSkin, setOnSkin] = useState(skin);

    // Modal Add / Edit States
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        referralCode: '',
        baseUrl: '',
        status: 'active'
    });

    const [confirm, setConfirm] = useState(false);
    const [currentData, setCurrentData] = useState(null);

    useEffect(() => {
        fetchLinks();
    }, [page, search, statusFilter]);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;

            const res = await getMarketingLinks(params);
            if (res.success) {
                setLinks(res.data);
                setTotalPages(res.pagination?.pages || 1);
            }
        } catch (error) {
            console.error("Failed to fetch links:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLinks();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ referralCode: '', baseUrl: '', status: 'active' });
        setIsEdit(false);
        setCurrentId(null);
    };

    const handleShowModal = (link = null) => {
        if (link) {
            setCurrentData(link); // Fix editing bug, save full link object
            setIsEdit(true);
        } else {
            setCurrentData(null);
            setIsEdit(false);
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValidSubmit = async (e, v) => {
        try {
            if (isEdit) {
                const updateData = {
                    referralCode: v.referralCode,
                };
                if (v.baseUrl) updateData.baseUrl = v.baseUrl;

                await updateMarketingLink(currentData._id, updateData);
            } else {
                await createMarketingLink({
                    referralCode: v.referralCode,
                    baseUrl: v.baseUrl
                });
            }
            fetchLinks();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving link", error);
            alert("Error saving link");
        }
    };


    const handleStatusToggle = (link) => {
        setCurrentData({
            _id: link._id,
            actionType: 'ToggleStatus',
            isActive: link.isActive,
            referralCode: link.referralCode,
            baseUrl: link.baseUrl || ''
        });
        setConfirm(true);
    };

    const handleDeleteClick = (link) => {
        setCurrentData({
            _id: link._id,
            actionType: 'Delete'
        });
        setConfirm(true);
    };

    const columns = [
        {
            name: 'Code',
            selector: row => row.referralCode,
            sortable: true,
            minWidth: '150px',
            cell: row => <strong>{row.referralCode}</strong>
        },
        {
            name: 'Link',
            selector: row => row.referralLink,
            sortable: true,
            minWidth: '250px',
            wrap: true,
            cell: row => (
                <div className="d-flex align-items-center gap-1">
                    <a href={row.referralLink} target="_blank" rel="noreferrer" className="text-truncate" style={{ maxWidth: '200px' }} title={row.referralLink}>
                        {row.referralLink}
                    </a>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-1"
                        title="Copy link"
                        onClick={() => {
                            navigator.clipboard.writeText(row.referralLink);
                            toast.success('Link copied');
                        }}
                    >
                        <i className="ri-file-copy-line" />
                    </button>
                </div>
            )
        },
        {
            name: 'Base URL',
            selector: row => row.baseUrl || '-',
            sortable: true,
            minWidth: '150px'
        },
        {
            name: 'Total Clicks',
            selector: row => row.totalClicks,
            sortable: true,
            minWidth: '100px'
        },
        {
            name: 'Created At',
            selector: row => new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
            minWidth: '130px'
        },
        {
            cell: (row) => <>
                <Button
                    onClick={() => handleStatusToggle(row)}
                    title={row.isActive ? "Active" : "Inactive"}
                    className={`btn_status ${row.isActive && 'active'}`}
                >
                    <span className="text-white">
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                </Button>
            </>,
            name: 'Status',
            ignoreRowClick: true,
            maxWidth: '110px'
        },
        {
            cell: (row) => <>
                <Button
                    onClick={() => handleShowModal(row)}
                    title={"Edit"}
                    variant="dark"
                    style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}
                >
                    <span className="ri-edit-fill" style={{ fontSize: 15 }}></span>
                </Button>
                <Button
                    onClick={() => handleDeleteClick(row)}
                    title={"Delete"}
                    variant="danger"
                    style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}
                >
                    <span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span>
                </Button>
            </>,
            name: 'Action',
            ignoreRowClick: true,
            maxWidth: '130px'
        }
    ];

    const handleConfirm = async () => {
        try {
            if (currentData.actionType === 'Delete') {
                await deleteMarketingLink(currentData._id);
            } else if (currentData.actionType === 'ToggleStatus') {
                const updateData = {
                    referralCode: currentData.referralCode,
                    isActive: !currentData.isActive,
                    status: !currentData.isActive ? 'active' : 'inactive',
                    baseUrl: currentData.baseUrl
                };
                await updateMarketingLink(currentData._id, updateData);
            }
            fetchLinks();
            setConfirm(false);
            setCurrentData(null);
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed. Please try again.");
        }
    };


    return (
        <React.Fragment>
            <Sidebar />
            <Header onSkin={setOnSkin} />
            <HeaderMobile />
            <div className="main main-app p-3 p-lg-4">
                <RsCard>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 pb-0">
                        <RsCardTitle className="mb-0"><b>Marketing Links</b></RsCardTitle>
                        <AdminAddButton label="Add Link" onClick={() => handleShowModal()} />
                    </div>

                    <div className="px-4 pb-3 mb-3 d-flex border-bottom justify-content-between">
                        <Form onSubmit={handleSearch} className="d-flex w-50">
                            <Form.Control
                                type="text"
                                placeholder="Search by Referral Code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="me-2"
                            />
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="me-2 w-auto"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                            <Button type="submit" variant="primary" style={{ backgroundColor: Utils.themeColor, border: 'none' }}>Search</Button>
                        </Form>
                    </div>

                    <div className="admin-datatable-scroll">
                    <DataTable
                        columns={columns}
                        data={links}
                        pagination
                        paginationServer
                        paginationTotalRows={totalPages * 10}
                        onChangePage={page => setPage(page)}
                        paginationPerPage={10}
                        paginationComponentOptions={dataTablePaginationOptions}
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                        customStyles={dataTableCustomStyles}
                        striped
                        highlightOnHover
                    />
                    </div>
                </RsCard>

                {/* Add / Edit Modal - Updated Design matches Banners */}
                <Modal isOpen={showModal} toggle={handleCloseModal} centered={true} size="md">
                    <ModalBody className="py-3 px-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">{isEdit ? 'Edit Marketing Link' : 'Add Marketing Link'}</h5>
                            <button className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <RsCard style={{ border: 'none', marginBottom: 0 }}>
                            <RsCardBody className="p-0">
                                <AvForm onValidSubmit={handleValidSubmit}>
                                    <div className="mb-4">
                                        <AvField
                                            name="referralCode"
                                            label="Referral Code *"
                                            value={currentData?.referralCode || ''}
                                            type="text"
                                            placeholder="e.g. DEMO-CAREVELI"
                                            required
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <AvField
                                            name="baseUrl"
                                            label="Base URL (Optional)"
                                            value={currentData?.baseUrl || ''}
                                            type="url"
                                            placeholder="e.g. https://careveli.com"
                                        />
                                    </div>

                                    <Row>
                                        <Col md={6}>
                                            <button
                                                className="btn btn-dark w-100 waves-effect waves-light"
                                                style={{ border: 'none', backgroundColor: '#dc3545' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCloseModal();
                                                }}
                                                type="button"
                                            >
                                                Cancel
                                            </button>
                                        </Col>
                                        <Col md={6}>
                                            <button
                                                className="btn btn-dark w-100 waves-effect waves-light"
                                                style={{ border: 'none', backgroundColor: '#dc3545' }}
                                                type="submit"
                                            >
                                                {isEdit ? 'Update' : 'Add'}
                                            </button>
                                        </Col>
                                    </Row>
                                </AvForm>
                            </RsCardBody>
                        </RsCard>
                    </ModalBody>
                </Modal>

                <ConfirmModal
                    show={confirm}
                    onCloseClick={() => {
                        setConfirm(false);
                        setCurrentData(null);
                    }}
                    onConfirm={handleConfirm}
                    data={currentData}
                />

                <Footer />
            </div>
        </React.Fragment>
    );
}

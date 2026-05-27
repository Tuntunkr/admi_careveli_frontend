import React, { useEffect, useState, useRef } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardSubtitle, CardTitle, Row, Col, Modal, ModalBody } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { del, get, post, put, upload } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import ConfirmModal from '../../components/ConfirmModal';
import * as Utils from "../../Utils";
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';

function PetCategory() {

    const user = useSelector(state => state.user);
    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [file, setFile] = useState(null);
    const imagePickerRef = useRef();

    useEffect(() => {
        if (user?.token) {
            getData();
        }
    }, [user]);

    useEffect(() => {
        setColumns([
            {
                name: "Image",
                cell: (row) => <>
                    <img src={row?.catPic} style={{ width: 70, height: 70, padding: 10 }} />
                </>,
                maxWidth: '200px',
                minWidth: '100px'
            },
            {
                name: 'Title',
                selector: row => row.catName,
            },
            {
                name: 'Date',
                selector: row => moment(row?.updatedAt).format("DD-MMM-YYYY"),
                minWidth: '130px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateStatus(row)}
                        title={row?.isActive ? "Inactive" : "Active"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                    >
                        <span className="text-white" style={{}}>
                            {!row?.isActive ? 'Inactive' : 'Active'}
                        </span>
                    </Button>
                </>,
                name: 'Status',
                ignoreRowClick: true,
                maxWidth: '110px'
            },
            {
                cell: (row) => <>
                    {/* <Button onClick={() => props?.history.push(`/product/` + row?._id)}
                title={"View"}
                style={{ backgroundColor: Utils.themeColor, marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}><span className="mdi mdi-eye" style={{ fontSize: 20 }}></span></Button> */}
                    <Button onClick={() => handleUpdateProj(row)}
                        title={"Edit"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}><span className="ri-edit-fill" style={{ fontSize: 15 }}></span></Button>
                    <Button onClick={() => handleDeleteProj(row)}
                        title={"Delete"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}><span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span></Button>
                </>,
                name: 'Action',
                ignoreRowClick: true,
                maxWidth: '130px'
            },
        ])
    }, [data]);

    useEffect(() => {
        if (!isAdd)
            setFile(null);
    }, [isAdd]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            get("petcategory", { token: user?.token })
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode == 200) {
                        setData(res?.data);
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toast.error("Something Went Wrong!");
                })
        }
    }

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "Status" });
        setConfirm(true);
    }

    const handleUpdateProj = (row) => {
        setCurrentData(row);
        setFile(row?.catPic);
        setIsAdd(true);
    }

    const handleDeleteProj = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    const onConfirm = () => {
        if (!loading) {
            setLoading(true);
            let body = {
                petcatId: currentData?._id,
                token: user?.token
            }
            if (currentData?.actionType == 'Status') {
                body = { ...body, isActive: !currentData?.isActive }
                put("petcategory", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            toast.success(res?.message);
                            setConfirm(false);
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            }
            if (currentData?.actionType == 'Delete') {
                del("petcategory", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            setConfirm(false);
                            toast.success(res?.message)
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            }
        }
    }

    const urltoFile = (url, filename, mimeType) => {
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    const handleValidSubmit = async (e, v) => {
        if (!loading) {
            setLoading(true);
            let body = {
                ...v,
                token: user?.token
            }
            console.log("file to check", file);
            if (!file) {
                toast.error("Please select a pet category Image!");
                return;
            }
            if (file?.substring(0, 4) == 'blob') {
                const obj = await urltoFile(file, new Date().getTime() + '.png', 'image/png');
                const form = new FormData();
                form.append("image", obj);
                const uploadRes = await upload("petcategory/image_upload", form);
                if (uploadRes?.statusCode == 200)
                    body = { ...body, catPic: uploadRes?.data };
            }
            if (currentData?._id) {
                body = { ...body, petcatId: currentData?._id }
                put("petcategory", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            setIsAdd(false);
                            toast.success(res?.message)
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            } else {
                post("petcategory", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            toast.success(res?.message);
                            setIsAdd(false);
                            getData();
                        } else {
                            toast.error(res?.error);
                        }
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("Error while adding city", err);
                        toast.error("Something Went Wrong!");
                    })
            }
        }
    }

    const handleImgChange = (file) => {
        setFile(URL.createObjectURL(file));
    }

    return (
        <React.Fragment>
            <Header />
            <ConfirmModal
                show={confirm}
                onConfirm={onConfirm}
                onCloseClick={() => setConfirm(false)}
                data={currentData}
            />

            {
                loading == true && <Loader />
            }

            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <Row className='mb-4'>
                        <Col md={11}>
                            <CardBody>
                                <CardTitle><b>Pet Category</b></CardTitle>
                            </CardBody>
                        </Col>
                        <Col md={1}>
                            <div className='action-btn'>
                                <button type="button" style={{ border: 'none', backgroundColor: Utils.themeColor }} className="btn btn-dark" onClick={() => { setCurrentData(null); setIsAdd(true) }}><i className={'ri-add-fill'} /></button>
                            </div>
                        </Col>
                    </Row>
                    <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                        columns={columns}
                        data={data}
                        pagination
                        conditionalRowStyles={[{
                            when: row => row?.style,
                            style: row => ({ width: row?.style?.width }),
                        },
                        ]}
                        customStyles={{
                            headCells: {
                                style: {
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 15,
                                    width: 0
                                },
                            },
                            cells: {
                                style: {
                                    width: 0
                                }
                            }
                        }}
                    />
                </Card>
                <Footer />
            </div>

            <Modal isOpen={isAdd} centered>
                <ModalBody>
                    <Card>
                        <CardBody>
                            <CardTitle className='mb-4'><b>{currentData?._id ? 'Update' : 'Add New Pet Category'}</b></CardTitle>
                            <AvForm onValidSubmit={handleValidSubmit}>
                                {file ?
                                    <div className='img-sqr-100'>
                                        <img src={file} style={{ width: '100%', height: '100%' }} />
                                        <div className='btn_cross'>
                                            <Button type="button" variant="danger" className="btn-add" onClick={() => { setFile(null); }}><i className={'fa fa-close'} /></Button>
                                        </div>
                                    </div>
                                    :
                                    <div className='img-place-sqr-100'>
                                        <div className='action-btn'>
                                            <Button type="button" variant="danger" className="btn-add" onClick={() => { console.log("ref", imagePickerRef?.current); imagePickerRef.current.click() }}><i className={'ri-image-fill'} /></Button>
                                            <input
                                                name="catPic"
                                                className="d-none"
                                                type="file"
                                                // accept=".pdf"
                                                onChange={(e) => handleImgChange(e.target.files[0])}
                                                ref={imagePickerRef}
                                            />
                                        </div>
                                    </div>
                                }
                                <div className='mb-4 mt-4'>
                                    <AvField
                                        name="catName"
                                        placeholder="Enter Pet Category"
                                        value={currentData?.catName}
                                        required
                                    />
                                </div>
                                <Row>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-dark w-100 waves-effect waves-light"
                                            style={{ border: 'none', backgroundColor: Utils.themeColor }} onClick={() => setIsAdd(false)} type="reset">  Cancel
                                        </button>
                                    </Col>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-dark w-100 waves-effect waves-light"
                                            style={{ border: 'none', backgroundColor: Utils.themeColor }} type="submit" > {currentData?._id ? 'Update' : 'Add'}
                                        </button>
                                    </Col>
                                </Row>
                            </AvForm>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </React.Fragment>
    )
}


export default PetCategory;
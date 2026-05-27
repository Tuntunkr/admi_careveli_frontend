import React, { useEffect, useState, useRef } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardSubtitle, CardTitle, Row, Col, Modal, ModalBody } from 'reactstrap'
import { get } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from "moment";

function PetCategory() {

    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        console.log('Component mounted/user updated');
        console.log('User state:', user);

        // Try to get token from Redux state or localStorage
        const token = user?.token || localStorage.getItem('adminToken');
        console.log('Token from Redux:', !!user?.token);
        console.log('Token from localStorage:', !!localStorage.getItem('adminToken'));
        console.log('Final token available:', !!token);

        if (token) {
            console.log('Token available, fetching data...');
            getData();
        } else {
            console.warn('⚠️ No token available in Redux or localStorage');
            console.warn('Please login first!');
        }
    }, [user]);

    useEffect(() => {
        setColumns([
            {
                name: 'Sl.No',
                cell: (row, index) => <>
                    <span>{index + 1}</span>
                </>,
                minWidth: '80px'

            },
            {
                name: "Profile Picture",
                cell: (row) => <>
                    <img
                        src={row?.profilePicture || row?.petPic || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQHstFutlfl8tgZAtY8nDWucSWEvFM5AETQ&s'}
                        style={{ width: 70, height: 70, padding: 10, objectFit: 'cover', borderRadius: '50%' }}
                        alt={row?.name || 'User'}
                        onError={(e) => { e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQHstFutlfl8tgZAtY8nDWucSWEvFM5AETQ&s' }}
                    />
                </>,
                minWidth: '100px'
            },
            {
                name: 'User Name',
                cell: (row, index) => <>
                    <p>{row?.name || 'N/A'}</p>
                </>,
                minWidth: '150px'
            },
            {
                name: 'Email',
                cell: (row, index) => <>
                    <p>{row?.email || 'N/A'}</p>
                </>,
                minWidth: '200px'
            },
            {
                name: 'Phone',
                selector: row => row?.phone || 'N/A',
                minWidth: '150px'
            },
            {
                name: 'Created At',
                selector: row => row?.createdAt ? moment(row?.createdAt).format("DD-MMM-YYYY hh:mm a") :
                    row?.updatedAt ? moment(row?.updatedAt).format("DD-MMM-YYYY") : 'N/A',
                minWidth: '170px'
            },
        ])
    }, [data]);

    const getData = () => {
        if (!loading) {
            setLoading(true);

            // Get token from Redux or localStorage
            const token = user?.token || localStorage.getItem('adminToken');

            console.log('Fetching users from API...');
            console.log('Using token:', token ? 'Available (' + token.substring(0, 20) + '...)' : 'Not available');

            get("user/all", { token: token })
                .then(res => {
                    console.log('Full API Response:', res);
                    console.log('Response success:', res?.success);
                    console.log('Response data:', res?.data);
                    console.log('Response data.users:', res?.data?.users);

                    setLoading(false);

                    // Check if response is successful and has data
                    if (res?.success === true) {
                        let users = [];

                        // Extract users array from response
                        if (res?.data?.users && Array.isArray(res.data.users)) {
                            users = res.data.users;
                            console.log('✅ Users array found:', users.length);
                        } else if (Array.isArray(res?.data)) {
                            users = res.data;
                            console.log('✅ Direct data array:', users.length);
                        }

                        console.log('Setting users data:', users);
                        setData(users);

                        const totalCount = res?.data?.totalUsers || users.length;
                        toast.success(`${totalCount} users fetched successfully`);
                    } else if (res?.statusCode === 200) {
                        // Fallback for old API structure
                        const users = Array.isArray(res?.data) ? res.data : [];
                        console.log('Old API structure - Users:', users.length);
                        setData(users);
                        toast.success(`${users.length} users loaded`);
                    } else {
                        console.error('❌ Unexpected response format:', res);
                        toast.error(res?.message || "No data received from server");
                        setData([]);
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error('❌ Error fetching users:', err);
                    toast.error("Failed to fetch users!");
                    setData([]);
                })
        }
    }


    const ExpandedComponent = ({ data }) =>
        <div className='expending_box'>
            <Row>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <h4>User ID</h4>
                    </div>
                    <div className='expend_detail'>
                        <h4>Name</h4>
                    </div>
                    <div className='expend_detail'>
                        <h4>Email</h4>
                    </div>
                    <div className='expend_detail'>
                        <h4>Phone</h4>
                    </div>
                    <div className='expend_detail'>
                        <h4>Profile Picture</h4>
                    </div>
                    {data?.petName && (
                        <>
                            <div className='expend_detail'>
                                <h4>Pet Name</h4>
                            </div>
                            <div className='expend_detail'>
                                <h4>Pet Breed</h4>
                            </div>
                        </>
                    )}
                </Col>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <p>{data?._id || 'N/A'}</p>
                    </div>
                    <div className='expend_detail'>
                        <p>{data?.name || 'N/A'}</p>
                    </div>
                    <div className='expend_detail'>
                        <p>{data?.email || 'N/A'}</p>
                    </div>
                    <div className='expend_detail'>
                        <p>{data?.phone || 'N/A'}</p>
                    </div>
                    <div className='expend_detail'>
                        <p>{data?.profilePicture ? 'Available' : 'Not Set'}</p>
                    </div>
                    {data?.petName && (
                        <>
                            <div className='expend_detail'>
                                <p>{data?.petName}</p>
                            </div>
                            <div className='expend_detail'>
                                <p>{data?.petBreed || 'N/A'}</p>
                            </div>
                        </>
                    )}
                </Col>
            </Row>
        </div>

    return (
        <React.Fragment>
            <Header />
            {
                loading == true && <Loader />
            }

            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <Row className='mb-4'>
                        <Col md={11}>
                            <CardBody>
                                <CardTitle><b>Registered User</b></CardTitle>
                            </CardBody>
                        </Col>
                    </Row>
                    <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                        columns={columns}
                        data={data}
                        pagination
                        expandableRows={true}
                        expandOnRowClicked={false}
                        expandableRowDisabled={row => row.disabled}
                        expandableRowsComponent={ExpandedComponent}
                        expandableRowsComponentProps={row => row.Action}
                        noDataComponent={
                            <div style={{ padding: '50px', textAlign: 'center' }}>
                                <h5>There are no records to display</h5>
                                {!user?.token && <p style={{ color: 'red' }}>Please login to view data</p>}
                            </div>
                        }
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

        </React.Fragment>
    )
}


export default PetCategory;
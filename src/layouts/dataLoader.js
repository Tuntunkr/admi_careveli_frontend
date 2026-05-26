import React from 'react'
import Spinner from 'react-bootstrap/Spinner';


export default function dataLoader() {
    return (
        <div>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Data Loader </p>
        </div>
    )
}

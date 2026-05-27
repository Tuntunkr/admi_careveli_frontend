import React from 'react';
import { Button } from 'react-bootstrap';
import * as Utils from '../../Utils';

export default function AdminAddButton({ label, onClick, className = '', size = 'sm' }) {
    return (
        <Button
            type="button"
            size={size}
            className={`admin-add-btn ${className}`.trim()}
            onClick={onClick}
            style={{ backgroundColor: Utils.themeColor, border: 'none' }}
        >
            <i className="ri-add-line me-1" />
            {label}
        </Button>
    );
}

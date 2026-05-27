import React from 'react';
import { Button } from 'react-bootstrap';

export default function AdminEmptyState({
    icon = 'ri-inbox-line',
    title = 'No records found',
    description = '',
    actionLabel = '',
    onAction,
}) {
    return (
        <div className="admin-empty-state text-center py-5 px-3">
            <i className={`${icon} admin-empty-state__icon`} aria-hidden="true" />
            <h6 className="fw-semibold mt-3 mb-1">{title}</h6>
            {description && <p className="text-secondary small mb-0">{description}</p>}
            {actionLabel && onAction && (
                <Button variant="primary" size="sm" className="mt-3" onClick={onAction}>
                    <i className="ri-add-line me-1" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

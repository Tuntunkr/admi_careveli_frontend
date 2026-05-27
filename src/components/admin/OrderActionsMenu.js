import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const MENU_WIDTH = 220;

export default function OrderActionsMenu({
    row,
    onView,
    onStatus,
    onShip,
    onDelete,
    isCreating,
    isAlreadyCreated,
}) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const toggleRef = useRef(null);
    const menuRef = useRef(null);

    const updateMenuPosition = useCallback(() => {
        if (!toggleRef.current) return;
        const rect = toggleRef.current.getBoundingClientRect();
        let left = rect.right - MENU_WIDTH;
        if (left < 8) left = 8;
        if (left + MENU_WIDTH > window.innerWidth - 8) {
            left = window.innerWidth - MENU_WIDTH - 8;
        }
        const estimatedHeight = 220;
        let top = rect.bottom + 4;
        if (top + estimatedHeight > window.innerHeight - 8) {
            top = Math.max(8, rect.top - estimatedHeight - 4);
        }
        setMenuStyle({
            position: 'fixed',
            top,
            left,
            zIndex: 2000,
            minWidth: MENU_WIDTH,
        });
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        updateMenuPosition();
        const onScrollOrResize = () => updateMenuPosition();
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [open, updateMenuPosition]);

    useEffect(() => {
        if (!open) return undefined;
        const handlePointerDown = (e) => {
            if (
                toggleRef.current?.contains(e.target) ||
                menuRef.current?.contains(e.target)
            ) {
                return;
            }
            setOpen(false);
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const close = () => setOpen(false);

    const run = (fn) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
        fn(row);
    };

    const portalMenu = open && menuStyle
        ? createPortal(
            <div
                ref={menuRef}
                className="dropdown-menu show shadow order-actions-portal-menu"
                style={menuStyle}
                role="menu"
            >
                <button type="button" className="dropdown-item" role="menuitem" onClick={run(onView)}>
                    <i className="ri-eye-line text-primary me-2" />
                    View details
                </button>
                <button type="button" className="dropdown-item" role="menuitem" onClick={run(onStatus)}>
                    <i className="ri-refresh-line me-2" />
                    Update status
                </button>
                <button
                    type="button"
                    className="dropdown-item"
                    role="menuitem"
                    disabled={isCreating || isAlreadyCreated}
                    onClick={run(onShip)}
                >
                    {isCreating ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Creating shipment…
                        </>
                    ) : isAlreadyCreated ? (
                        <>
                            <i className="ri-check-line text-success me-2" />
                            Shipment created
                        </>
                    ) : (
                        <>
                            <i className="ri-truck-line me-2" />
                            Create shipment
                        </>
                    )}
                </button>
                <div className="dropdown-divider" />
                <button
                    type="button"
                    className="dropdown-item text-danger"
                    role="menuitem"
                    onClick={run(onDelete)}
                >
                    <i className="ri-delete-bin-line me-2" />
                    Delete order
                </button>
            </div>,
            document.body
        )
        : null;

    return (
        <div className="order-table-actions">
            <button
                type="button"
                className="order-action-btn order-action-btn--view"
                title="View order details"
                aria-label="View order details"
                onClick={() => onView(row)}
            >
                <i className="ri-eye-line" />
            </button>

            <button
                ref={toggleRef}
                type="button"
                className={`order-actions-toggle btn btn-sm btn-outline-secondary ${open ? 'show' : ''}`}
                title="More actions"
                aria-label="More actions"
                aria-expanded={open}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
            >
                <i className="ri-more-2-fill" aria-hidden="true" />
            </button>

            {portalMenu}
        </div>
    );
}

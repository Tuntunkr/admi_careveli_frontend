import React from 'react';
import { getImageUrl } from '../Utils';

export const PRODUCT_IMAGE_PLACEHOLDER =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23eee"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="8" fill="%23999"%3EN/A%3C/text%3E%3C/svg%3E';

export const getOrderItemName = (item = {}) =>
    item.name || item.productName || item.title || item.product?.name || 'Unknown Product';

export const getOrderItemImage = (item = {}) => {
    const raw = item.image || item.productImage || item.product?.image || item.thumbnail;
    if (!raw) return '';
    if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        return raw;
    }
    return getImageUrl(raw);
};

function OrderItemsCell({ items = [], maxVisible = 3 }) {
    if (!items.length) {
        return <span className="text-muted small">No products</span>;
    }

    const visibleItems = items.slice(0, maxVisible);
    const hiddenCount = items.length - maxVisible;

    return (
        <div className="order-items-cell">
            {visibleItems.map((item, index) => {
                const productName = getOrderItemName(item);
                const imageSrc = getOrderItemImage(item) || PRODUCT_IMAGE_PLACEHOLDER;

                return (
                    <div className="order-item-row" key={`${productName}-${index}`}>
                        <span className="order-item-seq">{String(index + 1).padStart(2, '0')}</span>
                        <img
                            src={imageSrc}
                            alt={productName}
                            className="order-item-thumb"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PRODUCT_IMAGE_PLACEHOLDER;
                            }}
                        />
                        <div className="order-item-body">
                            <p className="order-item-name" title={productName}>
                                {productName}
                            </p>
                            <p className="order-item-meta">
                                Qty: <strong>{item.quantity || 1}</strong>
                                {item.size ? (
                                    <> · Size: <strong>{item.size}</strong></>
                                ) : null}
                            </p>
                        </div>
                    </div>
                );
            })}
            {hiddenCount > 0 && (
                <div className="order-items-more">
                    <i className="ri-more-line me-1"></i>
                    +{hiddenCount} more product{hiddenCount > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}

export default OrderItemsCell;

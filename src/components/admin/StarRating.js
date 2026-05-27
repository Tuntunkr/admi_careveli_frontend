import React from 'react';

export default function StarRating({ value = 0, max = 5 }) {
    const stars = Array.from({ length: max }, (_, i) => i + 1);
    return (
        <span className="star-rating" aria-label={`${value} out of ${max} stars`}>
            {stars.map(star => (
                <i
                    key={star}
                    className={star <= value ? 'ri-star-fill text-warning' : 'ri-star-line text-muted'}
                />
            ))}
        </span>
    );
}

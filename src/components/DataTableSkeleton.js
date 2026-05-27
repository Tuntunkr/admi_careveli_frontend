import React from 'react';

/**
 * Skeleton loader for react-data-table-component (progressComponent).
 */
function DataTableSkeleton({ rows = 8, columns = 6 }) {
    return (
        <div className="datatable-skeleton" aria-hidden="true">
            <div className="datatable-skeleton__header">
                {Array.from({ length: columns }).map((_, index) => (
                    <div
                        key={`head-${index}`}
                        className="datatable-skeleton__bar datatable-skeleton__bar--header"
                        style={{ width: `${55 + (index % 4) * 10}%` }}
                    />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="datatable-skeleton__row">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="datatable-skeleton__cell"
                        >
                            <div
                                className="datatable-skeleton__bar"
                                style={{ width: `${45 + ((rowIndex + colIndex) % 5) * 12}%` }}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default DataTableSkeleton;

const baseHeadCells = {
    style: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#111827',
        paddingLeft: '12px',
        paddingRight: '12px',
        whiteSpace: 'nowrap',
    },
};

const baseRows = {
    style: {
        minHeight: '52px',
        '&:hover': {
            backgroundColor: '#f8fafc',
            cursor: 'default',
        },
    },
    stripedStyle: {
        backgroundColor: '#fafbfc',
    },
};

const baseCells = {
    style: {
        fontSize: '13px',
        paddingLeft: '12px',
        paddingRight: '12px',
    },
};

export const dataTableCustomStyles = {
    table: { style: { minWidth: '100%' } },
    headCells: baseHeadCells,
    rows: baseRows,
    cells: baseCells,
};

export const dataTableWideStyles = {
    table: { style: { minWidth: '1280px' } },
    headCells: baseHeadCells,
    rows: baseRows,
    cells: {
        ...baseCells,
        style: {
            ...baseCells.style,
            overflow: 'visible',
        },
    },
};

export const dataTableProductStyles = {
    table: { style: { minWidth: '1050px' } },
    headCells: baseHeadCells,
    rows: baseRows,
    cells: baseCells,
};

export const dataTablePaginationOptions = {
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'All',
};

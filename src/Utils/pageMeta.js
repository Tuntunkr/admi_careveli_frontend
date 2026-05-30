export const ADMIN_PAGE_META = {
    '/admin/dashboard': { title: 'Analytics Dashboard', section: 'Dashboard' },
    '/category': { title: 'Category Management', section: 'Catalog' },
    '/subCategory': { title: 'Sub Category', section: 'Catalog' },
    '/product': { title: 'Product Management', section: 'Catalog' },
    '/order': { title: 'Order Management', section: 'Sales' },
    '/banner': { title: 'Banner Management', section: 'Content' },
    '/spotlight': { title: 'Spotlight', section: 'Content' },
    '/contact': { title: 'Contact Messages', section: 'Support' },
    '/testimonial': { title: 'Testimonials', section: 'Content' },
    '/newsletter': { title: 'Newsletter', section: 'Marketing' },
    '/blog-editor': { title: 'Blog Management', section: 'Content' },
    '/affiliate-users': { title: 'Affiliate Users', section: 'Users' },
    '/marketing-links': { title: 'Marketing Links', section: 'Marketing' },
    '/payment-history': { title: 'Payment History', section: 'Marketing' },
    '/registered': { title: 'Registered Users', section: 'Users' },
    '/registered_pet': { title: 'Registered Pets', section: 'Users' },
};

export function getPageMeta(pathname = '') {
    const match = Object.entries(ADMIN_PAGE_META)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([path]) => pathname === path || pathname.startsWith(`${path}/`));

    if (match) return match[1];
    return { title: 'Admin Panel', section: 'Dashboard' };
}

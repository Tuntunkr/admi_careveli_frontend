import {
    getAllActiveBanners,
    getAllBannersAdmin,
    getBannerById,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus
} from './banner_helper';

/**
 * Banner API Test Functions
 * Use these functions to test the banner API integration
 * Open browser console and call: window.testBannerAPI()
 */

// Test all API endpoints
export const testBannerAPI = async () => {
    console.log('=== Starting Banner API Tests ===\n');

    // Test 1: Get all active banners (public)
    console.log('Test 1: Get All Active Banners (Public)');
    try {
        const result = await getAllActiveBanners();
        console.log('✅ Success:', result);
        console.log(`Found ${result.data?.length || 0} active banners\n`);
    } catch (error) {
        console.error('❌ Error:', error, '\n');
    }

    // Test 2: Get all banners (admin) - requires token
    console.log('Test 2: Get All Banners (Admin)');
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.warn('⚠️ No admin token found. Please login first.\n');
        } else {
            const result = await getAllBannersAdmin(token);
            console.log('✅ Success:', result);
            console.log(`Found ${result.data?.length || 0} total banners\n`);
        }
    } catch (error) {
        console.error('❌ Error:', error, '\n');
    }

    console.log('=== Banner API Tests Complete ===');
};

// Test specific banner by ID
export const testGetBanner = async (bannerId) => {
    console.log(`Testing Get Banner: ${bannerId}`);
    try {
        const result = await getBannerById(bannerId);
        console.log('✅ Success:', result);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Test add banner (admin only)
export const testAddBanner = async (imageFile, title = 'Test Banner', isActive = true) => {
    console.log('Testing Add Banner');
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No admin token found. Please login first.');
            return null;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        if (title) formData.append('title', title);
        formData.append('isActive', isActive);

        const result = await addBanner(formData, token);
        console.log('✅ Success:', result);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Test update banner (admin only)
export const testUpdateBanner = async (bannerId, updates = {}) => {
    console.log(`Testing Update Banner: ${bannerId}`);
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No admin token found. Please login first.');
            return null;
        }

        const formData = new FormData();
        if (updates.title !== undefined) formData.append('title', updates.title);
        if (updates.isActive !== undefined) formData.append('isActive', updates.isActive);
        if (updates.image) formData.append('image', updates.image);

        const result = await updateBanner(bannerId, formData, token);
        console.log('✅ Success:', result);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Test toggle banner status (admin only)
export const testToggleBanner = async (bannerId) => {
    console.log(`Testing Toggle Banner Status: ${bannerId}`);
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No admin token found. Please login first.');
            return null;
        }

        const result = await toggleBannerStatus(bannerId, token);
        console.log('✅ Success:', result);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Test delete banner (admin only)
export const testDeleteBanner = async (bannerId) => {
    console.log(`Testing Delete Banner: ${bannerId}`);

    const confirmDelete = window.confirm('Are you sure you want to delete this banner? This is a test function.');
    if (!confirmDelete) {
        console.log('Delete cancelled');
        return null;
    }

    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No admin token found. Please login first.');
            return null;
        }

        const result = await deleteBanner(bannerId, token);
        console.log('✅ Success:', result);
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
};

// Quick test with sample data
export const quickTest = async () => {
    console.log('=== Running Quick Banner API Test ===\n');

    // Test public endpoint
    console.log('1. Testing public endpoint (no auth)...');
    const publicResult = await getAllActiveBanners();
    if (publicResult.statusCode === 200) {
        console.log(`✅ Public API working - Found ${publicResult.data?.length || 0} active banners`);
    } else {
        console.error('❌ Public API failed:', publicResult.message);
    }

    // Test admin endpoint
    console.log('\n2. Testing admin endpoint (with auth)...');
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.warn('⚠️ Skipping admin tests - No token found. Please login first.');
    } else {
        const adminResult = await getAllBannersAdmin(token);
        if (adminResult.statusCode === 200) {
            console.log(`✅ Admin API working - Found ${adminResult.data?.length || 0} total banners`);
        } else {
            console.error('❌ Admin API failed:', adminResult.message);
        }
    }

    console.log('\n=== Quick Test Complete ===');
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
    window.testBannerAPI = testBannerAPI;
    window.testGetBanner = testGetBanner;
    window.testAddBanner = testAddBanner;
    window.testUpdateBanner = testUpdateBanner;
    window.testToggleBanner = testToggleBanner;
    window.testDeleteBanner = testDeleteBanner;
    window.quickBannerTest = quickTest;
}

// Export for use in other files
export default {
    testBannerAPI,
    testGetBanner,
    testAddBanner,
    testUpdateBanner,
    testToggleBanner,
    testDeleteBanner,
    quickTest
};

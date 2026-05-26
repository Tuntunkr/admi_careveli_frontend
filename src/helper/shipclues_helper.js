import { getOrderById } from './order_helper';
import {
    SHIPCLUES_API_URL,
    SHIPCLUES_API_TOKEN,
    SHIPCLUES_WAREHOUSE_ID,
    SHIPCLUES_DEFAULTS,
    getImageUrl,
} from '../Utils';

const SHIPCLUES_CREATE_ORDER_PATH = '/seller/v1/order/create/';

export class ShipcluesError extends Error {
    constructor(message, statusCode = null, responseData = null) {
        super(message);
        this.name = 'ShipcluesError';
        this.statusCode = statusCode;
        this.responseData = responseData;
    }
}

const formatAmount = (value, decimals = 2) => {
    const num = Number(value);
    if (Number.isNaN(num)) return (0).toFixed(decimals);
    return num.toFixed(decimals);
};

const toNullableString = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return String(value);
};

const normalizePhone = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
};

const calculateInclusiveTax = (amount, rate = Number(SHIPCLUES_DEFAULTS.gstRate)) => {
    const num = Number(amount) || 0;
    const taxAmount = (num * rate) / (100 + rate);
    return {
        taxAmount,
        baseAmount: num - taxAmount,
    };
};

const getCustomerName = (address = {}) => {
    return [address.firstName, address.lastName].filter(Boolean).join(' ').trim();
};

const getPaymentMode = (paymentMethod = '') => {
    const method = String(paymentMethod).toLowerCase();
    if (method === 'cod') return 'cod';
    return 'prepaid';
};

const isCodOrder = (order) => {
    return getPaymentMode(order?.paymentMethod) === 'cod';
};

const getOrderTotal = (order) => Number(order?.total ?? order?.amount ?? 0);

const getOrderSubtotal = (order) => {
    if (order?.subtotal != null) return Number(order.subtotal);
    const items = order?.items || [];
    return items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
};

const getShippingCharges = (order) => Number(order?.shippingFee ?? order?.shippingCharges ?? 0);

const resolveProductImage = (item) => {
    const image = item?.image || item?.images?.[0] || item?.productImage;
    if (!image) return null;

    const url = getImageUrl(image);
    return url || null;
};

const buildProductPayload = (item, index) => {
    const unitPrice = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    const lineTotal = unitPrice * quantity;
    const { taxAmount } = calculateInclusiveTax(lineTotal);

    const lengthInCm = item.length_in_cm || item.lengthInCm || SHIPCLUES_DEFAULTS.packageLength;
    const breadthInCm = item.breadth_in_cm || item.breadthInCm || SHIPCLUES_DEFAULTS.packageBreadth;
    const heightInCm = item.height_in_cm || item.heightInCm || SHIPCLUES_DEFAULTS.packageHeight;
    const weightGm = item.weight_in_gm || item.weightInGm || item.weight || SHIPCLUES_DEFAULTS.packageWeightGm;

    return {
        sku: item.sku || item.productId || item._id || `ITEM-${index + 1}`,
        name: item.name || `Product ${index + 1}`,
        description: [item.name, item.size].filter(Boolean).join(' - ') || item.name || `Product ${index + 1}`,
        category: toNullableString(item.category),
        quantity,
        unit_price: formatAmount(unitPrice),
        discount_amount: formatAmount(item.discount || 0),
        is_tax_inclusive: true,
        tax_rate: SHIPCLUES_DEFAULTS.gstRate,
        tax_amount: formatAmount(taxAmount),
        total_amount: formatAmount(lineTotal),
        cgst_amount: null,
        sgst_amount: null,
        igst_amount: formatAmount(taxAmount),
        cess_amount: null,
        cgst_tax_rate: null,
        sgst_tax_rate: null,
        igst_tax_rate: SHIPCLUES_DEFAULTS.gstRate,
        cess_tax_rate: null,
        hsn_code: toNullableString(item.hsn_code || item.hsnCode) || '',
        length_in_cm: String(lengthInCm),
        breadth_in_cm: String(breadthInCm),
        height_in_cm: String(heightInCm),
        weight_in_gm: formatAmount(weightGm),
        ean: null,
        imei: null,
        brand: toNullableString(item.brand),
        color: toNullableString(item.color),
        serial_number: null,
        images: resolveProductImage(item),
    };
};

const getPackageDimensions = (items = []) => {
    const firstItem = items[0] || {};
    return {
        length: firstItem.length_in_cm || firstItem.lengthInCm || SHIPCLUES_DEFAULTS.packageLength,
        breadth: firstItem.breadth_in_cm || firstItem.breadthInCm || SHIPCLUES_DEFAULTS.packageBreadth,
        height: firstItem.height_in_cm || firstItem.heightInCm || SHIPCLUES_DEFAULTS.packageHeight,
    };
};

const getPackageWeightInGm = (items = []) => {
    const totalWeight = items.reduce((sum, item) => {
        const itemWeight = Number(item.weight_in_gm || item.weight || SHIPCLUES_DEFAULTS.packageWeightGm);
        const qty = Number(item.quantity || 1);
        return sum + itemWeight * qty;
    }, 0);

    return totalWeight || Number(SHIPCLUES_DEFAULTS.packageWeightGm);
};

export const validateOrderForShipment = (order) => {
    const errors = [];
    const address = order?.shippingAddress || order?.address || {};

    if (!order?.orderNumber) errors.push('Order number is missing');
    if (!getCustomerName(address)) errors.push('Customer name is missing');
    if (!normalizePhone(address.phone)) errors.push('Customer phone number is missing or invalid');
    if (!address.street && !address.addressLine1) errors.push('Shipping address is missing');
    if (!address.zipcode && !address.pincode) errors.push('Shipping pincode is missing');
    if (!address.city) errors.push('Shipping city is missing');
    if (!address.state) errors.push('Shipping state is missing');
    if (!order?.items?.length) errors.push('Order has no items');

    if (errors.length) {
        throw new ShipcluesError(`Cannot create shipment: ${errors.join(', ')}`);
    }
};

export const buildShipcluesPayload = (order) => {
    validateOrderForShipment(order);

    const address = order.shippingAddress || order.address || {};
    const customerName = getCustomerName(address);
    const phone = normalizePhone(address.phone);
    const subtotal = getOrderSubtotal(order);
    const shippingCharges = getShippingCharges(order);
    const totalAmount = getOrderTotal(order) || subtotal + shippingCharges;
    const { taxAmount: subtotalTax } = calculateInclusiveTax(subtotal);
    const items = order.items || [];
    const packageDimensions = getPackageDimensions(items);
    const packageWeightGm = getPackageWeightInGm(items);
    const cod = isCodOrder(order);

    return {
        order_number: order.orderNumber,
        order_invoice_number: toNullableString(order.invoiceNumber),
        customer_name: customerName,
        customer_email: toNullableString(address.email),
        customer_phone_number: phone,
        customer_isd_code: '+91',
        customer_gst_number: null,
        warehouse_id: SHIPCLUES_WAREHOUSE_ID,
        shipping_name: customerName,
        shipping_email: toNullableString(address.email),
        shipping_phone_number: phone,
        shipping_isd_code: '+91',
        shipping_alt_phone_number: null,
        shipping_alt_isd_code: null,
        shipping_address_type: null,
        shipping_address_line1: address.street || address.addressLine1 || '',
        shipping_address_line2: address.addressLine2 || address.landmark || '',
        shipping_landmark: toNullableString(address.landmark),
        shipping_pincode: String(address.zipcode || address.pincode || ''),
        shipping_city: address.city || '',
        shipping_state: address.state || '',
        shipping_country: address.country || 'India',
        shipping_latitude: null,
        shipping_longitude: null,
        billing_name: customerName,
        billing_email: toNullableString(address.email),
        billing_phone_number: phone,
        billing_isd_code: '+91',
        billing_alt_phone_number: '',
        billing_alt_isd_code: '+91',
        billing_address_type: null,
        billing_address_line1: address.street || address.addressLine1 || '',
        billing_address_line2: address.addressLine2 || address.landmark || '',
        billing_landmark: toNullableString(address.landmark),
        billing_pincode: String(address.zipcode || address.pincode || ''),
        billing_city: address.city || '',
        billing_state: address.state || '',
        billing_country: address.country || 'India',
        billing_latitude: null,
        billing_longitude: null,
        package_length_in_cm: String(packageDimensions.length),
        package_breadth_in_cm: String(packageDimensions.breadth),
        package_height_in_cm: String(packageDimensions.height),
        package_weight_in_gm: formatAmount(packageWeightGm),
        package_weight_in_kg: Number(formatAmount(packageWeightGm / 1000, 2)),
        cgst_amount: null,
        sgst_amount: null,
        igst_amount: formatAmount(subtotalTax),
        cess_amount: null,
        cgst_tax_rate: null,
        sgst_tax_rate: null,
        igst_tax_rate: SHIPCLUES_DEFAULTS.gstRate,
        cess_tax_rate: null,
        is_tax_inclusive: true,
        tax_rate: SHIPCLUES_DEFAULTS.gstRate,
        tax_amount: formatAmount(subtotalTax),
        shipping_charges: formatAmount(shippingCharges),
        cod_charges: null,
        gift_wrap_charges: null,
        discount_amount: order.discount ? formatAmount(order.discount) : null,
        subtotal_amount: formatAmount(subtotal),
        total_amount: formatAmount(totalAmount),
        suggested_awb_number: null,
        suggested_courier: null,
        ewaybill_number: null,
        payment_mode: getPaymentMode(order.paymentMethod),
        tags: null,
        notes: toNullableString(order.notes),
        is_cod: cod,
        spl_intruction: null,
        cod_collectable_amount: cod ? formatAmount(totalAmount) : null,
        is_mps: false,
        number_of_packets: 1,
        is_reverse: false,
        is_reverse_qc: false,
        return_reason: null,
        reseller_name: null,
        order_date: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        products: items.map(buildProductPayload),
    };
};

const parseShipcluesErrorMessage = (data, status) => {
    if (!data) return `Shipment creation failed with status ${status}`;

    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

    const fieldErrors = data.errors || data.non_field_errors;
    if (Array.isArray(fieldErrors)) return fieldErrors.join(', ');
    if (typeof fieldErrors === 'object' && fieldErrors) {
        return Object.entries(fieldErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
    }

    return `Shipment creation failed with status ${status}`;
};

export const createShipmentOnShipclues = async (payload) => {
    if (!SHIPCLUES_API_TOKEN) {
        throw new ShipcluesError(
            'Shipclues API token is not configured. Set REACT_APP_SHIPCLUES_API_TOKEN in .env.local'
        );
    }

    if (!SHIPCLUES_WAREHOUSE_ID) {
        throw new ShipcluesError(
            'Shipclues warehouse ID is not configured. Set REACT_APP_SHIPCLUES_WAREHOUSE_ID in .env.local'
        );
    }

    let response;
    try {
        response = await fetch(`${SHIPCLUES_API_URL}${SHIPCLUES_CREATE_ORDER_PATH}`, {
            method: 'POST',
            headers: {
                Authorization: `Token ${SHIPCLUES_API_TOKEN}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        if (error?.name === 'TypeError') {
            throw new ShipcluesError(
                'Unable to reach Shipclues API. This may be a network or CORS issue. Contact support if the problem persists.',
                null,
                error
            );
        }
        throw new ShipcluesError(error.message || 'Unexpected error while creating shipment');
    }

    let responseData = null;
    const contentType = response.headers.get('content-type') || '';

    try {
        responseData = contentType.includes('application/json')
            ? await response.json()
            : await response.text();
    } catch {
        responseData = null;
    }

    if (!response.ok) {
        throw new ShipcluesError(
            parseShipcluesErrorMessage(responseData, response.status),
            response.status,
            responseData
        );
    }

    return {
        success: true,
        data: responseData,
        message: responseData?.message || 'Shipment created successfully on Shipclues',
    };
};

export const createShipcluesShipmentFromOrder = async (order, adminToken = null) => {
    if (!order) {
        throw new ShipcluesError('Order is required');
    }

    let orderData = order;
    const hasBasicDetails =
        order?.orderNumber &&
        order?.items?.length &&
        (order?.shippingAddress || order?.address);

    if (!hasBasicDetails) {
        if (!order?._id) {
            throw new ShipcluesError('Order ID is required to fetch order details');
        }
        if (!adminToken) {
            throw new ShipcluesError('Admin authentication token is missing');
        }

        const orderResponse = await getOrderById(order._id, adminToken);

        if (!orderResponse?.success) {
            throw new ShipcluesError(orderResponse?.message || 'Failed to fetch order details');
        }

        orderData = orderResponse.data?.order || orderResponse.order;
    }

    if (!orderData) {
        throw new ShipcluesError('Order details not found');
    }

    const payload = buildShipcluesPayload(orderData);
    console.log('Shipclues create shipment payload:', payload);

    const result = await createShipmentOnShipclues(payload);
    console.log('Shipclues create shipment response:', result);

    return {
        ...result,
        order: orderData,
        payload,
    };
};

export const createShipcluesShipment = async (orderId, adminToken) => {
    if (!orderId) {
        throw new ShipcluesError('Order ID is required');
    }

    if (!adminToken) {
        throw new ShipcluesError('Admin authentication token is missing');
    }

    const orderResponse = await getOrderById(orderId, adminToken);

    if (!orderResponse?.success) {
        throw new ShipcluesError(orderResponse?.message || 'Failed to fetch order details');
    }

    const order = orderResponse.data?.order || orderResponse.order;

    return createShipcluesShipmentFromOrder(order, adminToken);
};

export const getShipcluesErrorMessage = (error) => {
    if (error instanceof ShipcluesError) return error.message;
    if (error?.message) return error.message;
    return 'Failed to create shipment on Shipclues';
};

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Row, Col, FormGroup, Label } from 'reactstrap';
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { upload } from '../../helper/api_helper';
import * as Utils from "../../Utils";
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import { getCategoryList } from '../../helper/category_helper';

function AddProduct({ currentData, onSuccess, onCancel }) {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [images, setImages] = useState({
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });
    const [imagePreviews, setImagePreviews] = useState({
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [isBestseller, setIsBestseller] = useState(false);
    const [ingredients, setIngredients] = useState('');
    const [benefits, setBenefits] = useState('');

    const [categories, setCategories] = useState([]);
    const availableSizes = ['10ml', '20ml', '30ml'];

    const getCategoryValue = () => {
        if (!currentData?.category) return '';
        if (typeof currentData.category === 'object') {
            return currentData.category._id || '';
        }
        return String(currentData.category);
    };

    useEffect(() => {
        fetchCategories();

        if (currentData) {
            setSelectedSizes(currentData?.sizes || []);
            setIsBestseller(currentData?.bestSeller || currentData?.bestseller || false);
            setIngredients(currentData?.ingredients ? currentData.ingredients.join(', ') : '');
            setBenefits(currentData?.benefits ? currentData.benefits.join(', ') : '');

            // Set image previews from existing product
            const productImages = currentData?.images || currentData?.image || [];
            if (productImages.length > 0) {
                const previews = {};
                productImages.forEach((img, index) => {
                    previews[`image${index + 1}`] = Utils.getImageUrl(img);
                });
                setImagePreviews(previews);
            }
        }
    }, [currentData]);

    const fetchCategories = async () => {
        try {
            const token = user?.token || localStorage.getItem('adminToken');
            // Try updating to the same endpoint used in index.js for consistency
            const res = await getCategoryList(token);
            if (res) {
                // Check if data is array or wrapped in data property
                const cats = res.data?.categories || res.data || (Array.isArray(res) ? res : []);
                setCategories(cats);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const resetForm = () => {
        setImages({
            image1: null,
            image2: null,
            image3: null,
            image4: null
        });
        setImagePreviews({
            image1: null,
            image2: null,
            image3: null,
            image4: null
        });
        setSelectedSizes([]);
        setIsBestseller(false);
        setIngredients('');
        setBenefits('');
    }

    const handleImageChange = (e, imageKey) => {
        const file = e.target.files[0];
        if (file) {
            setImages(prev => ({ ...prev, [imageKey]: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({ ...prev, [imageKey]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleRemoveImage = (imageKey) => {
        setImages(prev => ({ ...prev, [imageKey]: null }));
        setImagePreviews(prev => ({ ...prev, [imageKey]: null }));
    }

    const handleSizeToggle = (size) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    }

    const handleSubmit = (event, values) => {
        if (selectedSizes.length === 0) {
            toast.error("Please select at least one size");
            return;
        }

        if (!loading) {
            setLoading(true);

            const formData = new FormData();

            // Add ID for update
            if (currentData?._id) {
                formData.append('id', currentData._id);
            }

            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('price', values.price);

            // Add discountPrice if provided
            if (values.discountPrice && values.discountPrice.trim() !== '') {
                const discountPrice = Number(values.discountPrice);
                const price = Number(values.price);
                if (discountPrice > price) {
                    toast.error("Discount price cannot be higher than actual price.");
                    setLoading(false);
                    return;
                }
                formData.append('discountPrice', values.discountPrice);
            }

            formData.append('category', values.category);
            formData.append('subCategory', values.subCategory);
            formData.append('sizes', JSON.stringify(selectedSizes));
            formData.append('bestseller', isBestseller);
            formData.append('stock', values.stock || 0);
            formData.append('howToUse', values.howToUse || '');

            // Handle ingredients array
            if (ingredients && ingredients.trim()) {
                const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(item => item);
                formData.append('ingredients', JSON.stringify(ingredientsArray));
            }

            // Handle benefits array
            if (benefits && benefits.trim()) {
                const benefitsArray = benefits.split(',').map(item => item.trim()).filter(item => item);
                formData.append('benefits', JSON.stringify(benefitsArray));
            }

            // Append images
            Object.keys(images).forEach(key => {
                if (images[key]) {
                    formData.append(key, images[key]);
                }
            });

            const token = user?.token || localStorage.getItem('adminToken');

            // Fix: Use correct upload endpoint and explicitly append id for update
            const endpoint = currentData?._id ? "product/update" : "product/add";
            if (currentData?._id) {
                // Ensure id is exactly matching what backend expects e.g. productId if id didn't work
                formData.append('productId', currentData._id);
            }

            upload(endpoint, formData, token)
                .then(res => {
                    setLoading(false);
                    if (res?.success) {
                        toast.success(currentData?._id ? "Product updated successfully!" : "Product added successfully!");
                        resetForm();
                        if (onSuccess) onSuccess();
                    } else {
                        toast.error(res?.message || `Failed to ${currentData?._id ? 'update' : 'add'} product`);
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toast.error("Something went wrong!");
                    console.error(err);
                });
        }
    }

    return (
        <>
            {loading && <Loader />}
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); onCancel(); }}>Products</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {currentData ? 'Edit Product' : 'Add New Product'}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">
                            {currentData ? 'Edit Product' : 'Add New Product'}
                        </h4>
                    </div>
                    <Button
                        onClick={onCancel}
                        variant="outline-secondary"
                    >
                        <i className="ri-arrow-left-line me-2"></i>Back to Products
                    </Button>
                </div>

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <CardTitle className="h5 mb-4">Product Information</CardTitle>
                                <AvForm onValidSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <AvField
                                                name="name"
                                                label="Product Name"
                                                placeholder="Enter product name"
                                                type="text"
                                                value={currentData?.name || ''}
                                                errorMessage="Product name is required"
                                                validate={{ required: { value: true } }}
                                            />
                                        </Col>

                                        <Col md={12}>
                                            <AvField
                                                name="description"
                                                label="Description"
                                                placeholder="Enter product description"
                                                type="textarea"
                                                rows="3"
                                                value={currentData?.description || ''}
                                                errorMessage="Description is required"
                                                validate={{ required: { value: true } }}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <AvField
                                                name="price"
                                                label="Price"
                                                placeholder="Enter price"
                                                type="number"
                                                value={currentData?.price || ''}
                                                errorMessage="Price is required"
                                                validate={{
                                                    required: { value: true },
                                                    min: { value: 0 }
                                                }}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <AvField
                                                name="discountPrice"
                                                label="Discount Price"
                                                placeholder="Enter discount price (optional)"
                                                type="number"
                                                value={currentData?.discountPrice || ''}
                                                validate={{
                                                    min: { value: 0 }
                                                }}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <AvField
                                                name="stock"
                                                label="Stock Quantity"
                                                placeholder="Enter stock quantity"
                                                type="number"
                                                value={currentData?.stock || 0}
                                                validate={{
                                                    min: { value: 0 }
                                                }}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <AvField
                                                name="category"
                                                label="Category"
                                                type="select"
                                                value={getCategoryValue()}
                                                errorMessage="Category is required"
                                                validate={{ required: { value: true } }}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id || Math.random()} value={cat._id}>
                                                        {cat.title || cat.name || 'Unnamed Category'}
                                                    </option>
                                                ))}
                                            </AvField>
                                        </Col>

                                        {/* <Col md={6}>
                                            <AvField
                                                name="subCategory"
                                                label="Sub Category"
                                                type="select"
                                                value={currentData?.subCategory || ''}
                                                errorMessage="Sub category is required"
                                                validate={{ required: { value: true } }}
                                            >
                                                <option value="">Select Sub Category</option>
                                                {subCategories.map(subCat => (
                                                    <option key={subCat} value={subCat}>{subCat}</option>
                                                ))}
                                            </AvField>
                                        </Col> */}

                                        <Col md={6}>
                                            <FormGroup>
                                                <Label>Bestseller</Label>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={isBestseller}
                                                        onChange={(e) => setIsBestseller(e.target.checked)}
                                                    />
                                                    <label className="form-check-label">
                                                        Mark as Bestseller
                                                    </label>
                                                </div>
                                            </FormGroup>
                                        </Col>

                                        <Col md={12}>
                                            <FormGroup>
                                                <Label>Sizes *</Label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {availableSizes.map(size => (
                                                        <Button
                                                            key={size}
                                                            type="button"
                                                            variant={selectedSizes.includes(size) ? 'primary' : 'outline-primary'}
                                                            size="sm"
                                                            onClick={() => handleSizeToggle(size)}
                                                        >
                                                            {size}
                                                        </Button>
                                                    ))}
                                                </div>
                                                {selectedSizes.length > 0 && (
                                                    <small className="text-muted mt-2 d-block">
                                                        Selected: {selectedSizes.join(', ')}
                                                    </small>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        {/* <Col md={12}>
                                            <FormGroup>
                                                <Label>Ingredients (comma separated)</Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g., Ingredient 1, Ingredient 2, Ingredient 3"
                                                    value={ingredients}
                                                    onChange={(e) => setIngredients(e.target.value)}
                                                />
                                                <small className="text-muted">Separate multiple ingredients with commas</small>
                                            </FormGroup>
                                        </Col> */}

                                        {/* <Col md={12}>
                                            <FormGroup>
                                                <Label>Benefits (comma separated)</Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g., Benefit 1, Benefit 2, Benefit 3"
                                                    value={benefits}
                                                    onChange={(e) => setBenefits(e.target.value)}
                                                />
                                                <small className="text-muted">Separate multiple benefits with commas</small>
                                            </FormGroup>
                                        </Col> */}

                                        <Col md={12}>
                                            <AvField
                                                name="howToUse"
                                                label="How To Use"
                                                placeholder="Enter usage instructions"
                                                type="textarea"
                                                rows="3"
                                                value={currentData?.howToUse || ''}
                                            />
                                        </Col>

                                        {/* Image Upload Section */}
                                        <Col md={12}>
                                            <Label className="mb-3">Product Images</Label>
                                            <Row>
                                                {['image1', 'image2', 'image3', 'image4'].map((imgKey, index) => (
                                                    <Col md={6} key={imgKey} className="mb-3">
                                                        <FormGroup>
                                                            <Label>Image {index + 1}</Label>
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageChange(e, imgKey)}
                                                            />
                                                            {imagePreviews[imgKey] && (
                                                                <div className="mt-2 position-relative">
                                                                    <img
                                                                        src={imagePreviews[imgKey]}
                                                                        alt={`Preview ${index + 1}`}
                                                                        style={{
                                                                            width: '100%',
                                                                            maxHeight: '200px',
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px',
                                                                            border: '2px solid #ddd'
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-dark btn-sm position-absolute"
                                                                        onClick={() => handleRemoveImage(imgKey)}
                                                                        style={{
                                                                            top: '5px',
                                                                            right: '5px',
                                                                            borderRadius: '50%',
                                                                            width: '32px',
                                                                            height: '32px',
                                                                            padding: '0',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '18px',
                                                                            fontWeight: 'bold',
                                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                                                        }}
                                                                        title="Remove Image"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>
                                    </Row>

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={onCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            style={{ backgroundColor: Utils.themeColor, border: 'none' }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : (currentData ? 'Update Product' : 'Add Product')}
                                        </Button>
                                    </div>
                                </AvForm>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Footer />
            </div>
        </>
    );
}

export default AddProduct;

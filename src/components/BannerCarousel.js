import React, { useState, useEffect } from 'react';
import { getAllActiveBanners } from '../../helper/banner_helper';
import { toast } from 'react-toastify';
import './BannerCarousel.css';

/**
 * BannerCarousel Component
 * Displays all active banners in a carousel/slideshow format
 * This component is for public use (no authentication required)
 */
const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (autoplay && banners.length > 1) {
            const interval = setInterval(() => {
                nextSlide();
            }, 5000); // Change slide every 5 seconds

            return () => clearInterval(interval);
        }
    }, [currentIndex, banners, autoplay]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const result = await getAllActiveBanners();

            if (result.statusCode === 200 && result.data) {
                setBanners(result.data);
            } else {
                console.error('Error:', result.message);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? banners.length - 1 : prevIndex - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (loading) {
        return (
            <div className="banner-carousel-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!banners || banners.length === 0) {
        return null; // Don't show anything if no banners
    }

    return (
        <div
            className="banner-carousel-container"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
        >
            <div className="banner-carousel">
                {banners.map((banner, index) => (
                    <div
                        key={banner._id}
                        className={`banner-slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        <img
                            src={banner.image}
                            alt={banner.title || `Banner ${index + 1}`}
                            className="banner-image"
                        />
                        {banner.title && (
                            <div className="banner-overlay">
                                <h2 className="banner-title">{banner.title}</h2>
                            </div>
                        )}
                    </div>
                ))}

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            className="banner-nav-btn prev"
                            onClick={prevSlide}
                            aria-label="Previous banner"
                        >
                            <i className="ri-arrow-left-s-line"></i>
                        </button>
                        <button
                            className="banner-nav-btn next"
                            onClick={nextSlide}
                            aria-label="Next banner"
                        >
                            <i className="ri-arrow-right-s-line"></i>
                        </button>
                    </>
                )}

                {/* Dots Navigation */}
                {banners.length > 1 && (
                    <div className="banner-dots">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerCarousel;

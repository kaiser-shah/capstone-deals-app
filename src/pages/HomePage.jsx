import React, { useEffect, useState, useContext } from "react";
import SecondBar from "../components/navbars/SecondBar";
import DealCard from "../components/dealCard";
import LoginSignupModal from "../components/modals/LoginSignupModal";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Top from "../components/navbars/Top";
import { Modal, Button, ListGroup } from "react-bootstrap";
import CategoriesModal from "../components/modals/CategoriesModal";
import { AuthContext } from "../components/AuthProvider";

const DEAL_PLACEHOLDER = "/public/fallback-deal.png";
const AVATAR_PLACEHOLDER = "/public/fallback-avatar.png";
const BACKEND_URL = "https://capstone-deals-app-endpoints.vercel.app";

function getHoursAgo(created_at) {
    if (!created_at) return "";
    const created = new Date(created_at);
    const now = new Date();
    const diffMs = now - created;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) {
        return `${diffHrs}h ago`;
    } else {
        // Format as '17th Jun', '2nd Jan', etc.
        const day = created.getDate();
        const month = created.toLocaleString('en-US', { month: 'short' });
        // Get ordinal suffix
        function ordinal(n) {
            if (n > 3 && n < 21) return 'th';
            switch (n % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }
        return `${day}${ordinal(day)} ${month}`;
    }
}

export function getDomain(url) {
    try {
        const { hostname } = new URL(url);
        return hostname.replace('www.', '').split('.')[0];
    } catch {
        return "";
    }
}

export default function HomePage({ requireAuth }) {
    const { currentUser, token } = useContext(AuthContext);
    
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0); // 0: Hottest, 1: Trending, 2: All, 3: Categories
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showSideBar, setShowSideBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Function to fetch deals with pagination and sorting
    async function fetchDeals(page = 1, sortBy = 'net_votes', order = 'desc') {
        setLoading(true);
        setError(null);
        try {
            // Build URL with query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                sort: sortBy,
                order: order
            });

            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`${BACKEND_URL}/deals?${params}`, { headers });
            
            if (!res.ok) throw new Error("Failed to fetch deals");
            
            const data = await res.json();
            
            // Handle both old format (array) and new format (object with deals array)
            if (Array.isArray(data)) {
                // Old format - fallback
                setDeals(data);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalCount: data.length,
                    hasNextPage: false,
                    hasPrevPage: false
                });
            } else {
                // New format with pagination
                setDeals(data.deals || []);
                setPagination(data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalCount: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                });
            }
        } catch (err) {
            setError(err.message);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    }

    // Initial load
    useEffect(() => {
        fetchDeals();
    }, [token]); // Re-fetch when token changes (user logs in/out)

    // Handle tab changes
    useEffect(() => {
        let sortBy = 'net_votes';
        let order = 'desc';
        
        if (selectedTab === 0) {
            // Hottest - sort by net_votes descending (default)
            sortBy = 'net_votes';
            order = 'desc';
        } else if (selectedTab === 1) {
            // Trending - for now, same as hottest, but you could add time-based logic here
            sortBy = 'net_votes';
            order = 'desc';
        } else if (selectedTab === 2) {
            // All/Recent - sort by creation date
            sortBy = 'created_at';
            order = 'desc';
        }
        
        if (selectedTab !== 3) { // Don't fetch for categories tab
            fetchDeals(1, sortBy, order);
        }
    }, [selectedTab]);

    // Categories fetch (Original)
    // useEffect(() => {
    //     if (showCategoriesModal) {
    //         async function fetchCategoriesWithDeals() {
    //             try {
    //                 const res = await fetch(`${BACKEND_URL}/categories-with-deals`);
    //                 if (res.ok) {
    //                     let data = await res.json();
    //                     const others = data.filter(c => c.category_name.toLowerCase() === 'other');
    //                     const rest = data.filter(c => c.category_name.toLowerCase() !== 'other');
    //                     setCategories([...rest, ...others]);
    //                 }
    //             } catch {}
    //         }
    //         fetchCategoriesWithDeals();
    //     }
    // }, [showCategoriesModal]);

    useEffect(() => {
        if (showCategoriesModal) {
            async function fetchCategoriesWithDeals() {
                try {
                    const res = await fetch(`${BACKEND_URL}/categories-with-deals`, {
                        credentials: "include", // if you need cookies or auth
                        headers: {
                            "Content-Type": "application/json",
                            // Add Authorization header if needed:
                            // "Authorization": `Bearer ${yourToken}`
                        }
                    });
                    if (res.ok) {
                        let data = await res.json();
                        // Move "Other" category to the end
                        const others = data.filter(c => c.category_name.toLowerCase() === 'other');
                        const rest = data.filter(c => c.category_name.toLowerCase() !== 'other');
                        setCategories([...rest, ...others]);
                    }
                } catch (err) {
                    // Optionally handle error
                    setCategories([]);
                }
            }
            fetchCategoriesWithDeals();
        }
    }, [showCategoriesModal]);

    // Profile fetch (unchanged)
    async function fetchProfile() {
        try {
            if (!currentUser || !token) return;
                        
            const res = await fetch(`${BACKEND_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error("Profile fetch failed:", res.status, res.statusText);
                return;
            }
            const data = await res.json();
            setUserProfile(data.details);
        } catch (err) {
            console.error("Profile fetch error:", err);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, [currentUser, token]);

    // Handle pagination
    const handlePageChange = (newPage) => {
        let sortBy = 'net_votes';
        let order = 'desc';
        
        if (selectedTab === 0) {
            sortBy = 'net_votes';
            order = 'desc';
        } else if (selectedTab === 1) {
            sortBy = 'net_votes';
            order = 'desc';
        } else if (selectedTab === 2) {
            sortBy = 'created_at';
            order = 'desc';
        }
        
        fetchDeals(newPage, sortBy, order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter deals for display
    let displayedDeals = [...deals];

    // Handle trending filter (6 hours) - this is done on frontend since it's time-sensitive
    if (selectedTab === 1) {
        const now = new Date();
        displayedDeals = displayedDeals.filter(deal => {
            const created = new Date(deal.created_at);
            return (now - created) / (1000 * 60 * 60) <= 6;
        });
    }

    // Handle categories
    if (selectedTab === 3) {
        if (selectedCategory) {
            const cat = categories.find(c => c.category_name === selectedCategory);
            displayedDeals = cat ? [...cat.deals] : [];
        } else {
            displayedDeals = [];
        }
    }

    // Search filter
    if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        displayedDeals = displayedDeals.filter(deal =>
            (deal.title && deal.title.toLowerCase().includes(q)) ||
            (deal.description && deal.description.toLowerCase().includes(q)) ||
            (deal.merchant && deal.merchant.toLowerCase().includes(q)) ||
            (deal.username && deal.username.toLowerCase().includes(q))
        );
    }

    const categoryIcons = {
        "Fashion": "bi-sunglasses",
        "Home & Living": "bi-house-door",
        "Electronics": "bi-phone",
        "Food & Beverage": "bi-cup-straw",
        "Beauty & Personal Care": "bi-heart",
        "Pets": "bi-emoji-smile",
        "Sports & Outdoors": "bi-bicycle",
        "Other": "bi-three-dots"
    };

    return (
        <>
            <Top searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <SecondBar selectedTab={selectedTab} onTabSelect={setSelectedTab} onCategoriesClick={() => setShowCategoriesModal(true)} />
            <div
                id="homepage-deals"
                className="container-fluid px-2"
                style={{
                    paddingTop: 130,
                    paddingBottom: 60,
                }}
            >
                {loading && <div className="text-center py-8">Loading deals...</div>}
                
                {error && <div className="text-danger">{error}</div>}
                
                {!loading && !error && displayedDeals.length === 0 && (
                    <div className="text-center py-8">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-2">
                            No deals found
                        </h2>
                        <div className="text-lg text-gray-400 font-light">
                            ...yet!
                        </div>
                    </div>
                )}

                {!loading && !error && displayedDeals.map((deal) => {
                    // Fix image URLs
                    let imageUrl = DEAL_PLACEHOLDER;
                    if (deal.primary_image_url) {
                        imageUrl = deal.primary_image_url;
                    } else if (deal.images && deal.images.length > 0) {
                        const primary = deal.images.find(img => img.is_primary_pic);
                        imageUrl = (primary ? primary.image_url : deal.images[0].image_url) || DEAL_PLACEHOLDER;
                    }
                    if (imageUrl && !imageUrl.startsWith("http")) {
                        imageUrl = BACKEND_URL + imageUrl;
                    }

                    // Use top-level username and profile_pic from deal
                    let postedBy = deal.username || "Unknown";
                    let avatarUrl = deal.profile_pic || AVATAR_PLACEHOLDER;
                    if (avatarUrl && !avatarUrl.startsWith("http")) {
                        avatarUrl = BACKEND_URL + avatarUrl;
                    }

                    return (
                        <DealCard
                            key={deal.deal_id}
                            deal_id={deal.deal_id}
                            image={imageUrl}
                            title={deal.title}
                            votes={deal.net_votes}
                            isHot={deal.net_votes > 100}
                            postedAgo={getHoursAgo(deal.created_at)}
                            merchant={getDomain(deal.deal_url)}
                            avatar={avatarUrl}
                            postedBy={postedBy}
                            price={deal.price}
                            originalPrice={deal.original_price}
                            description={deal.description}
                            comments={deal.comment_count || 0}
                            dealLink={deal.deal_url || "#"}
                            user_vote={deal.user_vote}
                            requireAuth={requireAuth}
                        />
                    );
                })}

                {/* Pagination Controls - only show for non-category tabs */}
                {!loading && !error && selectedTab !== 3 && pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center mt-4 mb-4">
                        <nav>
                            <ul className="pagination" style={{ gap: 5 }}>
                                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        style={{backgroundColor: 'transparent', border: 'none', borderRadius: '45%', cursor: 'pointer'}}
                                        hover={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer'}}
                                    >
                                        <i className="bi bi-caret-left-fill" style={{color: 'red'}}></i>
                                    </button>
                                </li>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <li key={pageNum} className={`page-item ${pageNum === pagination.currentPage ? 'active' : ''}`} style={{cursor: 'pointer'}}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    backgroundColor: pageNum === pagination.currentPage ? 'red' : 'transparent', 
                                                    border: pageNum === pagination.currentPage ? '2px solid red' : '2px solid transparent', 
                                                    borderRadius: '45%', 
                                                    color: pageNum === pagination.currentPage ? 'white' : 'red', 
                                                    cursor: 'pointer'}}
                                                hover={{backgroundColor: 'red', border: '1px solid red', borderRadius: '45%', color: 'white', cursor: 'pointer'}}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}
                                
                                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer'}}
                                        hover={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer'}}
                                    >
                                        <i className="bi bi-caret-right-fill" style={{color: 'red'}}></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        {/* // removed page number display */}
                        {/* <div className="ms-3 text-muted">
                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} deals)
                        </div> */}
                    </div>
                )}
            </div>

            <CategoriesModal
                show={showCategoriesModal}
                onHide={() => setShowCategoriesModal(false)}
                categories={categories}
                onSelect={cat => setSelectedCategory(cat)}
                selectedCategory={selectedCategory}
                categoryIcons={categoryIcons}
            />
        </>
    );
}
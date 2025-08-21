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
    // ✅ CORRECT - Move useContext to top level
    const { currentUser, token } = useContext(AuthContext);
    
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0); // 0: Hottest, 1: Trending, 2: All, 3: Categories
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [categories, setCategories] = useState([]); // now array of {category_id, category_name, deals}
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryDeals, setCategoryDeals] = useState([]);
    const [showSideBar, setShowSideBar] = useState(false);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(""); // NEW

    useEffect(() => {
        async function fetchDeals() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("https://capstone-deals-app-endpoints.vercel.app/deals");
                if (!res.ok) throw new Error("Failed to fetch deals");
                let data = await res.json();
                // Sort by net_votes descending
                data.sort((a, b) => b.net_votes - a.net_votes);
                // Use only the primary_image_url from the deal object
                const dealsWithImages = data.map(deal => ({
                    ...deal,
                    imageUrl: deal.primary_image_url || deal.image_url || null,
                    
                }));
                
                setDeals(dealsWithImages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

    useEffect(() => {
        if (showCategoriesModal) {
            async function fetchCategoriesWithDeals() {
                try {
                    const res = await fetch("https://capstone-deals-app-endpoints.vercel.app/categories-with-deals");
                    if (res.ok) {
                        let data = await res.json();
                        // Move 'Other' to the end
                        const others = data.filter(c => c.category_name.toLowerCase() === 'other'); // 
                        const rest = data.filter(c => c.category_name.toLowerCase() !== 'other'); 
                        setCategories([...rest, ...others]);
                    }
                } catch {}
            }
            fetchCategoriesWithDeals();
        }
    }, [showCategoriesModal]);

    // ✅ CORRECT - Function now uses the context values from top level
    async function fetchProfile() {
        try {
            if (!currentUser || !token) return;
                        
            const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/user/profile`, {
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

    // ✅ CORRECT - useEffect will run when currentUser or token changes
    useEffect(() => {
        fetchProfile();
    }, [currentUser, token]);



    // Sort/filter deals based on selectedTab and selectedCategory
    let displayedDeals = [...deals];
    if (selectedTab === 0) {
        displayedDeals.sort((a, b) => b.net_votes - a.net_votes);
    } else if (selectedTab === 1) {
        const now = new Date();
        displayedDeals = displayedDeals
            .filter(deal => {
                const created = new Date(deal.created_at);
                return (now - created) / (1000 * 60 * 60) <= 6;
            })
            .sort((a, b) => b.net_votes - a.net_votes);
    } else if (selectedTab === 2) {
        displayedDeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (selectedTab === 3) {
        // Categories: show only deals for selectedCategory
        if (selectedCategory) {
            const cat = categories.find(c => c.category_name === selectedCategory);
            displayedDeals = cat ? [...cat.deals] : [];
        } else {
            displayedDeals = [];
        }
    }

    // Filter by search query
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
        "Fashion": "bi-sunglasses", // or "bi-shirt" if available
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
                    paddingTop: 130,   // adjust to match your nav height
                    paddingBottom: 60, // adjust to match your footer height
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
                        // Find the image with is_primary_pic true, or fallback to the first image (lowest display_order)
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
    )
}
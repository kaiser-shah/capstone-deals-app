import React, { useEffect, useState } from "react";
import SecondBar from "../components/navbars/SecondBar";
import DealCard from "../components/dealCard";
import LoginSignupModal from "../components/modals/LoginSignupModal";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Top from "../components/navbars/Top";
import { Modal, Button, ListGroup } from "react-bootstrap";
import CategoriesModal from "../components/modals/CategoriesModal";

const DEAL_PLACEHOLDER = "https://via.placeholder.com/90?text=No+Image";
const AVATAR_PLACEHOLDER = "https://via.placeholder.com/28?text=User";

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
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0); // 0: Hottest, 1: Trending, 2: All, 3: Categories
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [categories, setCategories] = useState([]); // now array of {category_id, category_name, deals}
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryDeals, setCategoryDeals] = useState([]);
    const [showSideBar, setShowSideBar] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchDeals() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://capstone-deals-app-endpoints.vercel.app/deals");
                if (!res.ok) throw new Error("Failed to fetch deals");
                let data = await res.json();
                // Sort by net_votes descending
                data.sort((a, b) => b.net_votes - a.net_votes);
                // For each deal, fetch images
                const dealsWithImages = await Promise.all(data.map(async (deal) => {
                    let imageUrl = deal.primary_image_url;
                    try {
                        const imgRes = await fetch(`http://capstone-deals-app-endpoints.vercel.app/deals/${deal.deal_id}/images`);
                        if (imgRes.ok) {
                            const images = await imgRes.json();
                            if (images.length > 0) {
                                imageUrl = images[0].image_url;
                            }
                        }
                    } catch {}
                    return { ...deal, imageUrl };
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
                    const res = await fetch("http://capstone-deals-app-endpoints.vercel.app/categories-with-deals");
                    if (res.ok) {
                        let data = await res.json();
                        // Move 'Other' to the end
                        const others = data.filter(c => c.category_name.toLowerCase() === 'other');
                        const rest = data.filter(c => c.category_name.toLowerCase() !== 'other');
                        setCategories([...rest, ...others]);
                    }
                } catch {}
            }
            fetchCategoriesWithDeals();
        }
    }, [showCategoriesModal]);

    async function fetchProfile() {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            const res = await fetch("http://capstone-deals-app-endpoints.vercel.app/user/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return; // Not logged in or error
            const data = await res.json();
            setUserProfile(data.details);
        } catch (err) {
            // Ignore profile errors for now
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    function handleLoginSuccess() {
        fetchProfile();
        setShowLoginModal(false);
        navigate('/profile');
    }

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
            <Top />
            <SecondBar selectedTab={selectedTab} onTabSelect={setSelectedTab} onCategoriesClick={() => setShowCategoriesModal(true)} />
            <div
                id="homepage-deals"
                className="container-fluid px-2"
                style={{
                    paddingTop: 130,   // adjust to match your nav height
                    paddingBottom: 60,
 // adjust to match your footer height
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
)}                {!loading && !error && displayedDeals.map((deal) => {
                    // Fix image URLs
                    let imageUrl = deal.imageUrl || DEAL_PLACEHOLDER;
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
            <LoginSignupModal
                show={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    )
}


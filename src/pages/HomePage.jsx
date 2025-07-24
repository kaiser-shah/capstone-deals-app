import React, { useEffect, useState } from "react";
import Top from "../components/navbars/Top";
import SecondBar from "../components/navbars/SecondBar";
import Bottom from "../components/navbars/Bottom";
import DealCard from "../components/dealCard";

const DEAL_PLACEHOLDER = "https://via.placeholder.com/90?text=No+Image";
const AVATAR_PLACEHOLDER = "https://via.placeholder.com/28?text=User";

function getHoursAgo(created_at) {
    if (!created_at) return "";
    const created = new Date(created_at);
    const now = new Date();
    const diffMs = now - created;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    return `${diffHrs}h ago`;
}

function getDomain(url) {
    try {
        const { hostname } = new URL(url);
        return hostname.replace('www.', '').split('.')[0];
    } catch {
        return "";
    }
}

export default function HomePage() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        async function fetchDeals() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:3000/deals");
                if (!res.ok) throw new Error("Failed to fetch deals");
                let data = await res.json();
                // Sort by net_votes descending
                data.sort((a, b) => b.net_votes - a.net_votes);
                // For each deal, fetch images
                const dealsWithImages = await Promise.all(data.map(async (deal) => {
                    let imageUrl = deal.primary_image_url;
                    try {
                        const imgRes = await fetch(`http://localhost:3000/deals/${deal.deal_id}/images`);
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
        async function fetchProfile() {
            try {
                const res = await fetch("/user/profile");
                if (!res.ok) return; // Not logged in or error
                const data = await res.json();
                setUserProfile(data.details);
            } catch (err) {
                // Ignore profile errors for now
            }
        }
        fetchProfile();
    }, []);

    return (
        <>
            <Top />
            <SecondBar />
            <div
                id="homepage-deals"
                className="container-fluid px-2"
                style={{
                    paddingTop: 130,   // adjust to match your nav height
                    paddingBottom: 80,
 // adjust to match your footer height
                }}
            >
                {loading && <div>Loading deals...</div>}
                {error && <div className="text-danger">{error}</div>}
                {!loading && !error && deals.length === 0 && <div>No deals found.</div>}
                {!loading && !error && deals.map((deal) => {
                    const isCurrentUser = userProfile && deal.posted_by === userProfile.username;
                    // Fix image URLs
                    let imageUrl = deal.imageUrl || DEAL_PLACEHOLDER;
                    if (imageUrl && !imageUrl.startsWith("http")) {
                        imageUrl = BACKEND_URL + imageUrl;
                    }
                    let avatarUrl = (isCurrentUser
                        ? userProfile.profile_pic
                        : deal.avatar_url) || AVATAR_PLACEHOLDER;
                    if (avatarUrl && !avatarUrl.startsWith("http")) {
                        avatarUrl = BACKEND_URL + avatarUrl;
                    }
                    return (
                        <DealCard
                            key={deal.deal_id}
                            image={imageUrl}
                            title={deal.title}
                            votes={deal.net_votes}
                            isHot={deal.net_votes > 100}
                            postedAgo={getHoursAgo(deal.created_at)}
                            merchant={getDomain(deal.deal_url)}
                            avatar={avatarUrl}
                            postedBy={deal.posted_by}
                            description={deal.description}
                            comments={deal.comment_count || 0}
                            dealLink={deal.deal_url || "#"}
                        />
                    );
                })}
            </div>
            <Bottom />
        </>
    )
}
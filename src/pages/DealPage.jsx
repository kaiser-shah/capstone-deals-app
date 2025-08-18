import React, { useEffect, useState } from "react";
import Top from "../components/navbars/Top";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import PostDealModal from "../components/modals/PostDealModal";
import { Modal, Button } from "react-bootstrap";
import DealCard from "../components/dealCard";
import { getDomain } from "./HomePage";
import { getAuth, signOut } from "firebase/auth";
import LoginSignupModal from "../components/modals/LoginSignupModal";

export default function DealPage() {
  const { deal_id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [authRefresh, setAuthRefresh] = React.useState(0); // unified for login/logout
  const navigate = useNavigate()


  function handleDealEdited(updatedDeal) {
    // Refetch deal data after edit.
    setShowEditModal(false);
    // Optionally show a success message
    // Refetch deal
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/${deal_id}/full`);
        if (!res.ok) throw new Error("Failed to fetch deal");
        const data = await res.json();
        setDeal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }

  async function handleRemoveDeal() {
    setRemoving(true);
    try {
      const auth = (await import('firebase/auth')).getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/${deal.deal_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeal(d => ({ ...d, is_active: false }));
        setShowRemoveModal(false);
      }
    } finally {
      setRemoving(false);
    }
  }

  async function handleUndoRemove() {
    setRemoving(true);
    try {
      const auth = (await import('firebase/auth')).getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/${deal.deal_id}/reactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeal(d => ({ ...d, is_active: true }));
      }
    } finally {
      setRemoving(false);
    }
  }

  function requireAuth(action) {
    setShowLoginModal(true);
  }
  function handleLoginSuccess() {
    setShowLoginModal(false);
    setAuthRefresh(r => r + 1); // trigger refetch
  }
  async function handleLogout() {
    const auth = getAuth();
    try {
      await signOut(auth);
      setAuthRefresh(r => r + 1); // trigger refetch
    } catch (error) {
      // Optionally show error
    }
  }

  useEffect(() => {
    async function fetchDeal() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/${deal_id}/full`,);
        if (!res.ok) throw new Error("Failed to fetch deal");
        const data = await res.json();
        setDeal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [deal_id, authRefresh]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <div className="text-danger text-center py-5">{error}</div>;
  if (!deal) return null;

  return (
    <div className="container" style={{ maxWidth: 600, paddingTop: 90, minHeight: '100vh', paddingBottom: 40, overflow: 'visible', filter: deal.is_active === false ? 'grayscale(1) opacity(0.6)' : 'none', position: 'relative' }}>
      {/* Inactive badge */}
      {deal.is_active === false && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <span style={{ background: '#fff', color: '#e53935', border: '2px solid #e53935', borderRadius: 8, padding: '6px 16px', fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            Inactive
          </span>
        </div>
      )}
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb align-items-center" style={{ background: 'none', padding: 0, margin: 0 }}>
          <li className="breadcrumb-item">
            <Link to="/">
              <i className="bi bi-house-door-fill" style={{ fontSize: 18, verticalAlign: 'middle' }} />
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page" style={{ fontSize: 15, fontWeight: 500 }}>
            {deal.category_name || deal.category || deal.categoryName || deal.categoryLabel || "Category"}
          </li>
        </ol>
      </nav>

      {/* Image Gallery Section */}
      <ImageGallery images={deal.images} />

      {/* Voting Section */}
      <VotingSection 
        deal_id={deal.deal_id}
        initialVotes={deal.net_votes}
        userVote={deal.user_vote}
        requireAuth={requireAuth}
      />
      {/* Posted on date below net votes */}
      <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: 15, color: '#888', fontWeight: 500 }}>
        <span>Posted {formatDatePosted(deal.created_at)}</span>
      </div>
      {/* Example logout button for demonstration, remove or move as needed */}
      <button className="btn btn-outline-secondary mb-3" onClick={handleLogout} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>Log Out</button>

      {/* Deal Information Section */}
      <DealInfoSection 
        title={deal.title}
        price={deal.price}
        originalPrice={deal.original_price}
        merchant={getDomain(deal.deal_url)}
        dealUrl={deal.deal_url}
      />

      {/* Action Buttons Section */}
      <ActionButtonsSection 
        deal={deal}
        onEdit={() => setShowEditModal(true)}
        onRemove={() => setShowRemoveModal(true)}
        isInactive={deal.is_active === false}
        onUndo={handleUndoRemove}
      />

      {/* Deal Details Section */}
      <DealDetailsSection deal={deal} />

      {/* Feature Buttons (Inactive) Section */}
      <FeatureButtonsSection />

      {/* Related Deals Section */}
      <RelatedDealsSection deal={deal} />

      {/* Edit Deal Modal */}
      <PostDealModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onDealPosted={handleDealEdited}
        initialData={deal}
        isEdit={true}
      />

      {/* Remove confirmation modal */}
      <RemoveDealModal
        show={showRemoveModal}
        onHide={() => setShowRemoveModal(false)}
        onConfirm={handleRemoveDeal}
        removing={removing}
      />

    </div>
  );
}

// ImageGallery component for DealPage
function ImageGallery({ images }) {
  const [current, setCurrent] = React.useState(0);
  const maxImages = 5;
  const imgs = (images && images.length > 0) ? images.slice(0, maxImages) : [{ image_url: "/fallback-deal.png" }];

  // Touch state for swipe
  const [touchStartX, setTouchStartX] = React.useState(null);
  const [touchEndX, setTouchEndX] = React.useState(null);

  function handleThumbnailClick(idx) {
    setCurrent(idx);
  }

  function handlePrev() {
    setCurrent(c => (c > 0 ? c - 1 : c));
  }

  function handleNext() {
    setCurrent(c => (c < imgs.length - 1 ? c + 1 : c));
  }

  // Touch event handlers for swipe
  function onTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  }
  function onTouchMove(e) {
    setTouchEndX(e.touches[0].clientX);
  }
  function onTouchEnd() {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) { // minimum swipe distance
      if (diff > 0 && current < imgs.length - 1) {
        // swipe left
        setCurrent(current + 1);
      } else if (diff < 0 && current > 0) {
        // swipe right
        setCurrent(current - 1);
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  }

  return (
    <div className="mb-4">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          disabled={current === 0}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#e53935',
            zIndex: 2,
            cursor: current === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
          }}
          aria-label="Previous image"
        >
          <i className="bi bi-chevron-left" />
        </button>
        {/* Main image with swipe handlers */}
        <img
          src={imgs[current].image_url}
          alt={`Deal image ${current + 1}`}
          style={{
            width: 340,
            height: 220,
            objectFit: 'contain',
            background: '#fff',
            borderRadius: 16,
            border: '2px solid #e53935',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            display: 'block',
            margin: '0 auto',
            touchAction: 'pan-y'
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        {/* Right arrow */}
        <button
          onClick={handleNext}
          disabled={current === imgs.length - 1}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#e53935',
            zIndex: 2,
            cursor: current === imgs.length - 1 ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
          }}
          aria-label="Next image"
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
      {/* Thumbnails */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {imgs.map((img, idx) => (
          <img
            key={idx}
            src={img.image_url}
            alt={`Thumbnail ${idx + 1}`}
            onClick={() => handleThumbnailClick(idx)}
            style={{
              width: 54,
              height: 54,
              objectFit: 'cover',
              borderRadius: 10,
              border: current === idx ? '2px solid #e53935' : '2px solid #eee',
              boxShadow: current === idx ? '0 2px 8px rgba(229,57,53,0.15)' : 'none',
              cursor: 'pointer',
              opacity: current === idx ? 1 : 0.7,
              transition: 'border 0.2s, box-shadow 0.2s, opacity 0.2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// VotingSection component for DealPage
function VotingSection({ deal_id, initialVotes, userVote: initialUserVote, requireAuth }) {
  const [votes, setVotes] = React.useState(initialVotes || 0);
  const [userVote, setUserVote] = React.useState(initialUserVote); // 'up', 'down', or null
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setVotes(initialVotes || 0);
  }, [initialVotes]);
  React.useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);

  async function handleVote(vote_type) {
    if (loading) return;
    setLoading(true);
    try {
      const auth = (await import('firebase/auth')).getAuth();
      const user = auth.currentUser;
      if (!user) {
        if (requireAuth) requireAuth('vote');
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/addremove/vote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deal_id, vote_type })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === "added") {
          setVotes(v => vote_type === "up" ? v + 1 : v - 1);
          setUserVote(vote_type);
        } else if (data.action === "removed") {
          setVotes(v => vote_type === "up" ? v - 1 : v + 1);
          setUserVote(null);
        } else if (data.action === "updated") {
          setVotes(v => vote_type === "up" ? v + 2 : v - 2);
          setUserVote(vote_type);
        }
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-between mb-4" style={{ gap: 16 }}>
      <div className="d-flex align-items-center border rounded-pill px-2 py-1" style={{ gap: 8 }}>
        <button
          className={`btn rounded-circle p-2 me-1 dealcard-arrow-btn dealcard-arrow-down ${userVote === 'down' ? 'btn-primary text-white' : 'btn-outline-primary'}`}
          title="Downvote"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderWidth: 2 }}
          onClick={() => handleVote('down')}
          disabled={loading}
        >
          <i className="bi bi-arrow-down" style={{ fontSize: 18 }} />
        </button>
        <div className="fw-bold" style={{ color: votes > 100 ? '#e53935' : '#222', fontSize: 18 }}>{votes}&deg;</div>
        <button
          className={`btn rounded-circle p-2 ms-1 dealcard-arrow-btn dealcard-arrow-up ${userVote === 'up' ? 'btn-danger text-white' : 'btn-outline-danger'}`}
          title="Upvote"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderWidth: 2 }}
          onClick={() => handleVote('up')}
          disabled={loading}
        >
          <i className="bi bi-arrow-up" style={{ fontSize: 18 }} />
        </button>
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="d-flex align-items-center text-secondary" style={{ fontSize: 18, cursor: 'not-allowed' }} title="Comments (coming soon)">
          <i className="bi bi-chat-left-text me-1" />
        </span>
        <span className="d-flex align-items-center text-secondary" style={{ fontSize: 18, cursor: 'not-allowed' }} title="Share (coming soon)">
          <i className="bi bi-share me-1" />
        </span>
        <span className="d-flex align-items-center text-secondary" style={{ fontSize: 18, cursor: 'not-allowed' }} title="Save (coming soon)">
          <i className="bi bi-bookmark me-1" />
        </span>
      </div>
    </div>
  );
}

// DealInfoSection component for DealPage
function DealInfoSection({ title, price, originalPrice, merchant, dealUrl }) {
  let discount = null;
  if (originalPrice && price && parseFloat(originalPrice) > parseFloat(price)) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return (
    <div className="mb-4">
      <div className="fw-bold fs-4 mb-2" style={{ lineHeight: 1.2 }}>{title}</div>
      <div className="d-flex align-items-end gap-3 mb-2">
        <span className="fw-bold" style={{ fontSize: 28, color: '#e53935' }}>RM{price}</span>
        {originalPrice && (
          <span className="text-secondary" style={{ fontSize: 18, textDecoration: 'line-through' }}>RM{originalPrice}</span>
        )}
        {discount && (
          <span className="badge bg-success" style={{ fontSize: 15, fontWeight: 600 }}>-{discount}%</span>
        )}
      </div>
      <div className="text-secondary mb-1" style={{ fontSize: 15 }}>
        Available at <span className="fw-semibold text-primary">{merchant}</span>
      </div>
    </div>
  );
}

// ActionButtonsSection component for DealPage
function ActionButtonsSection({ deal, onEdit, onRemove, isInactive, onUndo }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  React.useEffect(() => {
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth();
      setCurrentUser(auth.currentUser);
    });
  }, []);

  const isCreator = currentUser && deal.user_id && currentUser.uid === deal.user_id;

  return (
    <div className="d-flex flex-column align-items-stretch gap-2 mb-4">
      <a
        href={deal.deal_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-danger fw-bold rounded-pill mb-1"
        style={{ fontSize: 18 }}
      >
        Get deal*
      </a>
      {isCreator && (
        <>
          <button className="btn btn-outline-dark rounded-pill mb-1" style={{ fontSize: 16 }} onClick={onEdit}>Edit Deal</button>
          {isInactive ? (
            <button className="btn btn-outline-secondary rounded-pill" style={{ fontSize: 16 }} onClick={onUndo}>Undo</button>
          ) : (
            <button className="btn btn-outline-danger rounded-pill" style={{ fontSize: 16 }} onClick={onRemove}>Remove Deal</button>
          )}
        </>
      )}
    </div>
  );
}

// RemoveDealModal component
function RemoveDealModal({ show, onHide, onConfirm, removing }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <h5>Remove Deal?</h5>
        <div className="text-secondary mb-3">Are you sure you want to remove this deal? This can be undone.</div>
        <Button variant="danger" className="me-2" onClick={onConfirm} disabled={removing}>Remove</Button>
        <Button variant="secondary" onClick={onHide} disabled={removing}>Cancel</Button>
      </Modal.Body>
    </Modal>
  );
}

// DealDetailsSection component for DealPage
function DealDetailsSection({ deal }) {
  const navigate = useNavigate(); // <-- add this here
  // Placeholder values for user stats (replace with real data if available)
  const userAvatar = deal.profile_pic || "/fallback-avatar.png";
  const username = deal.username || "Unknown";
  let postedBy = deal.username || "Unknown";
  const [totalDeals, setTotalDeals] = React.useState(deal.user_total_deals || 0);
  const accountCreated = deal.user_created_at ? formatDatePosted(deal.user_created_at) : (deal.account_created_at ? formatDatePosted(deal.account_created_at) : "--");
  const totalLikes = deal.user_total_likes || 0;
  const description = deal.description || "";
  const company = getDomain(deal.deal_url)
  const dealUrl = deal.deal_url;
  const lastUpdated = deal.updated_at ? formatDatePosted(deal.updated_at) : (deal.created_at ? formatDatePosted(deal.created_at) : "--");

  // Fetch total deals for this user if not present
  React.useEffect(() => {
    async function fetchUserDealsCount() {
      if (deal.user_id && (!deal.user_total_deals || deal.user_total_deals === 0)) {
        try {
          const auth = (await import('firebase/auth')).getAuth();
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken();
          const res = await fetch(`https://capstone-deals-app-endpoints.vercel.app/deals/user/${deal.user_id}`,{
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const deals = await res.json();
            setTotalDeals(deals.length);
          }
        } catch {}
      }
    }
    fetchUserDealsCount();
  }, [deal.user_id, deal.user_total_deals]);

  return (
    <div className="mb-4 p-3 bg-light rounded-4 shadow-sm">
      <div className="fw-bold mb-3" style={{ fontSize: 18 }}>About this deal</div>
      <div className="d-flex align-items-center mb-3 gap-3">
        <img src={userAvatar} alt={username} className="rounded-circle" style={{ width: 48, height: 48, objectFit: 'cover', border: '2px solid #e53935' }} />
        <div>
        <div className="fw-bold" style={{ fontSize: 17 }}>
          <span
            className="text-secondary"
            style={{ fontWeight: 400, fontSize: 15, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={e => {
              e.stopPropagation();
              navigate(`/user/${postedBy}`);
            }}
          >
            Posted by {username}
          </span>
        </div>
          <div className="text-secondary" style={{ fontSize: 13 }}>Joined {accountCreated}</div>
          <div className="d-flex gap-3 mt-1" style={{ fontSize: 13 }}>
            <span><i className="bi bi-bag me-1" /> {totalDeals} Deals</span>
            <span><i className="bi bi-heart me-1" /> {totalLikes} Likes</span>
          </div>
        </div>
      </div>
      <div className="mb-3" style={{ fontSize: 15, whiteSpace: 'pre-line' }}>{description}</div>
      <div className="mb-2">
        <a href={dealUrl} target="_blank" rel="noopener noreferrer" className="fw-bold text-primary" style={{ fontSize: 15 }}>
          More details at {company}
        </a>
      </div>
      <div className="text-secondary" style={{ fontSize: 13 }}>
        Last updated: {lastUpdated}
      </div>
    </div>
  );
}

// FeatureButtonsSection component for DealPage
function FeatureButtonsSection() {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center mb-2 px-1" style={{ gap: 10, lineHeight: 1.1 }}>
      <span className="d-flex align-items-center justify-content-center text-secondary" style={{ fontSize: 15, cursor: 'not-allowed', padding: '8px 0', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', minWidth: 130, minHeight: 38, textAlign: 'center' }} title="New Comment (coming soon)">
        <i className="bi bi-chat-left-text me-1" /> New Comment
      </span>
      <span className="d-flex align-items-center justify-content-center text-secondary" style={{ fontSize: 15, cursor: 'not-allowed', padding: '8px 0', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', minWidth: 130, minHeight: 38, textAlign: 'center' }} title="Expired? (coming soon)">
        <i className="bi bi-hourglass-split me-1" /> Expired?
      </span>
      <span className="d-flex align-items-center justify-content-center text-secondary" style={{ fontSize: 15, cursor: 'not-allowed', padding: '8px 0', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', minWidth: 130, minHeight: 38, textAlign: 'center' }} title="Report Thread (coming soon)">
        <i className="bi bi-flag me-1" /> Report Thread
      </span>
      <span className="d-flex align-items-center justify-content-center text-secondary" style={{ fontSize: 15, cursor: 'not-allowed', padding: '8px 0', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', minWidth: 130, minHeight: 38, textAlign: 'center' }} title="Save (coming soon)">
        <i className="bi bi-bookmark me-1" /> Save
      </span>
    </div>
  );
}

// RelatedDealsSection component for DealPage
function RelatedDealsSection({ deal }) {
  const [relatedDeals, setRelatedDeals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRelated() {
      setLoading(true);
      try {
        const res = await fetch("https://capstone-deals-app-endpoints.vercel.app/categories-with-deals");
        if (res.ok) {
          const categories = await res.json();
          const cat = categories.find(c => c.category_name === deal.category_name);
          if (cat && cat.deals) {
            // Exclude the current deal
            setRelatedDeals(cat.deals.filter(d => d.deal_id !== deal.deal_id));
          } else {
            setRelatedDeals([]);
          }
        }
      } catch {
        setRelatedDeals([]);
      } finally {
        setLoading(false);
      }
    }
    if (deal.category_name) fetchRelated();
  }, [deal.category_name, deal.deal_id]);

  return (
    <div className="mb-4">
      <div className="fw-bold mb-2" style={{ fontSize: 18 }}>You may also like</div>
      {loading ? (
        <div className="text-secondary py-3">Loading related deals...</div>
      ) : relatedDeals.length === 0 ? (
        <div className="text-secondary py-3">No related deals found.</div>
      ) : (
        <div className="d-flex flex-nowrap overflow-auto gap-2 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {relatedDeals.map(rd => (
            <a
              key={rd.deal_id}
              href={rd.deal_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minWidth: 140,
                maxWidth: 150,
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                padding: 8,
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                height: 180
              }}
            >
              <img
                src={rd.primary_image_url || "/fallback-deal.png"}
                alt={rd.title}
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
              />
              <div
                className="fw-bold"
                style={{ fontSize: 13, width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}
                title={rd.title}
              >
                {rd.title}
              </div>
              <div
                className="text-danger fw-bold"
                style={{ fontSize: 13, width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}
              >
                RM{rd.price}
              </div>
              <div
                className="text-secondary"
                style={{ fontSize: 12, width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={rd.merchant || rd.company || rd.store || rd.category_name || ''}
              >
                {rd.merchant || rd.company || rd.store || rd.category_name || ''}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to format date posted
function formatDatePosted(created_at) {
  if (!created_at) return "";
  const created = new Date(created_at);
  const day = created.getDate();
  const month = created.toLocaleString('en-US', { month: 'short' });
  const year = created.getFullYear().toString().slice(-2);
  function ordinal(n) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  return `${day}${ordinal(day)} ${month} ${year}`;
}


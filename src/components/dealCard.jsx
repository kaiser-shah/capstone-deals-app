import React, { useState, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getAuth } from "firebase/auth";

const BACKEND_URL = "http://localhost:3000";
const DEAL_PLACEHOLDER = "/fallback-deal.png";
const AVATAR_PLACEHOLDER = "/fallback-avatar.png";

export default function DealCard({
  
  image,
  title,
  votes: initialVotes,
  upvotes,
  downvotes,
  isHot,
  postedAgo,
  merchant,
  avatar,
  postedBy,
  description,
  comments,
  dealLink,
  price,
  originalPrice,
  deal_id,
  user_vote,
  requireAuth
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [loading, setLoading] = useState(false);
  const [userVote, setUserVote] = useState(user_vote); // 'up', 'down', or null

  // Sync with backend prop after refresh or parent update
  useEffect(() => {
    setUserVote(user_vote);
  }, [user_vote]);


  async function handleVote(vote_type) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      if (requireAuth) requireAuth('vote');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/deals/addremove/vote`, {
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

  // Check if user is logged in
  const auth = getAuth();
  const user = auth.currentUser;
  const isLoggedIn = !!user;

  return (
    <div id="dealcard-root" className="bg-white rounded-4 shadow-sm p-3 mb-2 w-100" style={{ border: '1px solid #eee', overflow: 'visible' }}> 
      {/* Header: Votes and Posted Ago */}
      <div id="dealcard-header" className="d-flex justify-content-between align-items-start mb-2">
        <div id="dealcard-header-votes" className="d-flex align-items-center me-2 border rounded-pill" style={{ padding: '4px' }}>
          <button
            className={`btn rounded-circle p-2 me-1 dealcard-arrow-btn dealcard-arrow-down ${isLoggedIn && userVote === 'down' ? 'btn-primary text-white' : 'btn-outline-primary'}`}
            title="Downvote"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2
            }}
            onClick={() => handleVote('down')}
            disabled={loading}
          >
            <i className="bi bi-arrow-down" style={{ fontSize: 18 }} />
          </button>
          <div id="dealcard-header-votes-count" className="fw-bold" style={{ color: isHot ? '#e53935' : '#222', fontSize: 15 }}>{votes}&deg;</div>
          <button
            className={`btn rounded-circle p-2 ms-1 dealcard-arrow-btn dealcard-arrow-up ${isLoggedIn && userVote === 'up' ? 'btn-danger text-white' : 'btn-outline-danger'}`}
            title="Upvote"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2
            }}
            onClick={() => handleVote('up')}
            disabled={loading}
          >
            <i className="bi bi-arrow-up" style={{ fontSize: 18 }} />
          </button>
        </div>
        <span className="badge bg-light text-secondary fs-6 fw-normal" style={{ borderRadius: 8, padding: '6px 12px' }}>Posted on {postedAgo}</span>
      </div>
      {/* Main Content */}
      <div id="dealcard-main" className="d-flex gap-3">
        <img
          src={image}
          alt={title || 'Deal'}
          className="rounded-3"
          style={{ width: 90, height: 90, objectFit: 'cover' }}
          onError={e => {
            if (!e.target.src.includes('fallback-deal.png')) {
              e.target.onerror = null;
              e.target.src = DEAL_PLACEHOLDER;
            }
          }}
        />
        <div id="dealcard-main-content" className="flex-grow-1">
          <div id="dealcard-main-title" className="fw-bold fs-6 mb-1">{title}</div>
          <div id="dealcard-main-merchant" className="text-secondary mb-2" style={{ fontSize: 14 }}>Available at <span className="fw-semibold text-primary">{merchant}</span></div>
          <div id="dealcard-main-postedby" className="d-flex align-items-center mb-2">
            <img
              src={avatar}
              alt={postedBy || 'User'}
              className="rounded-circle me-2"
              style={{ width: 28, height: 28, objectFit: 'cover' }}
              onError={e => {
                if (!e.target.src.includes('fallback-avatar.png')) {
                  e.target.onerror = null;
                  e.target.src = AVATAR_PLACEHOLDER;
                }
              }}
            />
            <span className="text-secondary" style={{ fontSize: 13 }}>Posted by {postedBy}</span> 
          </div>
          <div id="dealcard-main-description" className="text-secondary mb-2" style={{ fontSize: 13, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{description}</div>
          <div id="dealcard-main-price" className="d-flex align-items-center mb-2">
            <span style={{ fontSize: 15, color: '#e53935', fontWeight: 600 }}>RM</span>
            <span className="fw-bold" style={{ fontSize: 20, color: '#e53935', marginRight: 4 }}>
              {price}
            </span>
            {originalPrice && (
              <>
                <span style={{ fontSize: 13, color: '#888', marginRight: 2, textDecoration: 'line-through' }}></span>
                <span className="text-secondary" style={{ fontSize: 15, textDecoration: 'line-through', marginRight: 4 }}>
                  {originalPrice}
                </span>
                {parseFloat(originalPrice) > parseFloat(price) && (
                  <span style={{ color: 'green', fontWeight: 700, fontSize: 15 }}>
                    -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Footer: Comments, Share, Get Deal */}
      <div id="dealcard-footer" className="d-flex align-items-center justify-content-between mt-3"> 
        <div id="dealcard-footer-comments" className="d-flex align-items-center gap-3">
          <span id="dealcard-footer-comments-count" className="d-flex align-items-center text-secondary" style={{ fontSize: 15 }}>
            <i className="bi bi-chat-left-text me-1" style={{ fontSize: 18 }} /> {comments}
          </span>
          <span id="dealcard-footer-share" className="d-flex align-items-center text-secondary" style={{ fontSize: 15 }}>
            <i className="bi bi-share me-1" style={{ fontSize: 18 }} /> Share
          </span>
        </div>
        <a href={dealLink} target="_blank" rel="noopener noreferrer" className="btn btn-danger rounded-pill fw-bold d-flex align-items-center" style={{ fontSize: 16 }}>
          Get deal* <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: 18 }} />
        </a>
      </div>
    </div>
  );
}

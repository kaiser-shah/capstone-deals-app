import React from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

const DEAL_PLACEHOLDER = "/fallback-deal.png";
const AVATAR_PLACEHOLDER = "/fallback-avatar.png";

export default function DealCard({
  image,
  title,
  votes,
  isHot,
  postedAgo,
  merchant,
  avatar,
  postedBy,
  description,
  comments,
  dealLink
}) {
  return (
    <div id="dealcard-root" className="bg-white rounded-4 shadow-sm p-3 mb-2 w-100" style={{ border: '1px solid #eee', overflow: 'visible' }}> 
      {/* Header: Votes and Posted Ago */}
      <div id="dealcard-header" className="d-flex justify-content-between align-items-start mb-2">
        <div id="dealcard-header-votes" className="d-flex align-items-center me-2">
          <button
            className="btn btn-outline-primary rounded-circle p-2 me-1 dealcard-arrow-btn dealcard-arrow-down"
            title="Downvote"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2
            }}
          >
            <i className="bi bi-arrow-down" style={{ fontSize: 18 }} />
          </button>
          <div id="dealcard-header-votes-count" className="fw-bold" style={{ color: isHot ? '#e53935' : '#222', fontSize: 15 }}>{votes}&deg;</div>
          <button
            className="btn btn-outline-danger rounded-circle p-2 ms-1 dealcard-arrow-btn dealcard-arrow-up"
            title="Upvote"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2
            }}
          >
            <i className="bi bi-arrow-up" style={{ fontSize: 18 }} />
          </button>
        </div>
        <span className="badge bg-light text-secondary fs-6 fw-normal" style={{ borderRadius: 8, padding: '6px 12px' }}>Posted {postedAgo}</span>
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
          <div id="dealcard-main-description" className="text-secondary mb-2" style={{ fontSize: 13 }}>{description}</div>
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

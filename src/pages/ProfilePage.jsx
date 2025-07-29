import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import { Button, Form, Modal, Image, Row, Col, ListGroup, Spinner, InputGroup } from "react-bootstrap";
import { AuthContext } from "../components/AuthProvider";

const BACKEND_URL = "https://capstone-deals-app-wmbj.vercel.app";
const AVATAR_PLACEHOLDER = "/fallback-avatar.png";

export default function ProfilePage({ setUserProfile }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const fileInputRef = useRef();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [dealToRemove, setDealToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    async function fetchProfileAndDeals() {
      setLoading(true);
      try {
        // Get profile
        const token = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.details);
          setUsername(data.details.username);
        }
        // Get user's deals
        const dealsRes = await fetch(`${BACKEND_URL}/deals/user/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (dealsRes.ok) {
          const dealsData = await dealsRes.json();
          // Sort by date desc
          dealsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setDeals(dealsData);
        }
      } catch {}
      setLoading(false);
    }
    fetchProfileAndDeals();
  }, [navigate]);

  // Avatar upload
  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const fd = new FormData();
      fd.append("profile_pic", file);
      const res = await fetch(`${BACKEND_URL}/user/profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(p => ({ ...p, profile_pic: data.profile_pic }));
        if (setUserProfile) {
          setUserProfile(p => ({ ...p, profile_pic: data.profile_pic }));
        }
      } else {
        setAvatarError("Failed to upload avatar.");
      }
    } catch {
      setAvatarError("Failed to upload avatar.");
    }
    setAvatarUploading(false);
  }

  // Username edit
  async function handleUsernameSave() {
    setUsernameError("");
    if (!username.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }
    if (username === profile.username) {
      setEditUsername(false);
      return;
    }
    // Check uniqueness
    try {
      const res = await fetch(`${BACKEND_URL}/user/exists?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setUsernameError("Username already taken");
          return;
        }
      }
      // Update username
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const updateRes = await fetch(`${BACKEND_URL}/user/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username })
      });
      if (updateRes.ok) {
        setProfile(p => ({ ...p, username }));
        setEditUsername(false);
      } else {
        setUsernameError("Failed to update username");
      }
    } catch {
      setUsernameError("Failed to update username");
    }
  }

  // Password reset
  async function handlePasswordReset() {
    setResetEmailSent(false);
    setShowResetModal(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, profile.email);
      setResetEmailSent(true);
    } catch {}
  }

  // Log out
  const handleLogOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Signed out");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // NOTE: Make sure your backend /deals/user/:user_id returns is_active for each deal!
  const handleRemoveDeal = useCallback(async (deal, makeActive) => {
    setRemoving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      let res;
      if (makeActive) {
        // Reactivate
        res = await fetch(`${BACKEND_URL}/deals/${deal.deal_id}/reactivate`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Soft delete
        res = await fetch(`${BACKEND_URL}/deals/${deal.deal_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (res.ok) {
        setDeals(ds => ds.map(d => d.deal_id === deal.deal_id ? { ...d, is_active: makeActive } : d));
        setShowRemoveModal(false);
        setDealToRemove(null);
      }
    } finally {
      setRemoving(false);
    }
  }, []);

  if (loading || !profile) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <div className="container" style={{ maxWidth: 900, paddingTop: 100, paddingBottom: 55 }}>
        <div className="d-flex flex-column align-items-center">
          <div className="position-relative mb-2">
            <Image
              src={profile.profile_pic || AVATAR_PLACEHOLDER}
              roundedCircle
              style={{ width: 130, height: 130, objectFit: "cover", border: "2px solid #e53935" }}
            />
            <Button
              variant="light"
              className="position-absolute bottom-0 end-0 "
              style={{ borderRadius: "50%", background: "#fff", border: "1px solid #e53935", height: 35, width: 35, padding: 0 }}
              onClick={() => fileInputRef.current.click()}
              disabled={avatarUploading}
            >
              <i className="bi bi-pencil" style={{ color: '#e53935', fontSize: 18 }}></i>
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          {avatarError && <div className="text-danger small mb-2">{avatarError}</div>}
          <div className="d-flex align-items-center mb-1">
            {editUsername ? (
              <InputGroup size="sm">
                <Form.Control
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  isInvalid={!!usernameError}
                  style={{ maxWidth: 160 }}
                />
                <Button variant="outline-success" size="sm" onClick={handleUsernameSave}>Save</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => { setEditUsername(false); setUsername(profile.username); }}>Cancel</Button>
                <Form.Control.Feedback type="invalid">{usernameError}</Form.Control.Feedback>
              </InputGroup>
            ) : (
              <>
                <span className="fw-bold fs-5 me-2">{profile.username}</span>
                <Button variant="link" size="sm" style={{ color: '#e53935', padding: 0 }} onClick={() => setEditUsername(true)}>
                  <i className="bi bi-pencil-square" />
                </Button>
              </>
            )}
          </div>
          <div className="text-secondary mb-2">{profile.email}</div>
          <div className="d-flex justify-content-center align-items-center gap-4 bg-light rounded-pill px-3 py-2 mb-3" style={{ fontSize: 15 }}>
            <span><i className="bi bi-bag me-1" /> {deals.length} Deals</span>
            <span><i className="bi bi-chat-left-text me-1" /> 0 Comments</span>
            <span><i className="bi bi-trophy me-1" /> 0 Rank</span>
          </div>
          <Button variant="danger" size="sm" className="mb-3" onClick={handlePasswordReset}>
            Change Password
          </Button>
          <Button variant="outline-secondary" size="sm" className="mb-3" onClick={handleLogOut}>
            Log Out
          </Button>
        </div>
        <h5 className="mb-3">{profile.username}'s Deals</h5>
        <ListGroup>
          {deals.map(deal => (
            <ListGroup.Item
              key={deal.deal_id}
              className="p-2 mb-2 rounded-3 shadow-sm border-0"
              style={{ background: '#fafafa', position: 'relative', filter: deal.is_active === false ? 'grayscale(1) opacity(0.6)' : 'none', cursor: 'pointer' }}
              onClick={() => navigate(`/deal/${deal.deal_id}`)}
            >
              <div className="d-flex align-items-center gap-2 position-relative">
                {deal.is_active === false && (
                  <div style={{ position: 'absolute', top: -10, left: 0, right: 0, textAlign: 'center', color: '#e53935', fontWeight: 600, fontSize: 13 }}>
                    Removed
                  </div>
                )}
                <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 12, color: '#888', fontWeight: 500 }}>
                  {formatDatePosted(deal.created_at)}
                </div>
                <img src={deal.primary_image_url || "/fallback-deal.png"} alt={deal.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: 15 }}>{deal.title}</div>
                  <div className="text-secondary" style={{ fontSize: 13,  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{deal.description}</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <span className="fw-bold text-danger" style={{ fontSize: 15 }}>RM{deal.price}</span>
                    {deal.original_price && <span className="text-secondary" style={{ fontSize: 13, textDecoration: 'line-through' }}>RM{deal.original_price}</span>}
                  </div>
                </div>
                <div className="d-flex flex-column align-items-center ms-0" style={{ minWidth: 80, marginTop: 20 }}>
                  <a
                    href={deal.deal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-danger btn-sm mb-2"
                    style={{ fontSize: 15 }}
                    onClick={e => e.stopPropagation()}
                  >
                    Link*
                  </a>
                  {(deal.is_active === false) ? (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={e => { e.stopPropagation(); handleRemoveDeal(deal, true); }}
                      disabled={removing}
                    >
                      Undo
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={e => { e.stopPropagation(); setDealToRemove(deal); setShowRemoveModal(true); }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      {/* Remove confirmation modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <h5>Remove Deal?</h5>
          <div className="text-secondary mb-3">Are you sure you want to remove this deal? This can be undone.</div>
          <Button variant="danger" className="me-2" onClick={() => handleRemoveDeal(dealToRemove, false)} disabled={removing}>Remove</Button>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)} disabled={removing}>Cancel</Button>
        </Modal.Body>
      </Modal>
      {/* Password reset modal (restored) */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Body className="text-center p-4">
          {resetEmailSent ? (
            <>
              <h5>Password Reset Email Sent</h5>
              <div className="text-secondary mb-3">Check your email for a link to reset your password.</div>
              <Button variant="danger" onClick={() => setShowResetModal(false)}>Close</Button>
            </>
          ) : (
            <>
              <h5>Send Password Reset Email?</h5>
              <div className="text-secondary mb-3">A password reset link will be sent to your email address.</div>
              <Button variant="danger" onClick={() => setShowResetModal(false)}>Cancel</Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
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


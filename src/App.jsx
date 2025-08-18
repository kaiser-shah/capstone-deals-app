import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Top from "./components/navbars/Top";
import Bottom from "./components/navbars/Bottom";
import LoginSignupModal from "./components/modals/LoginSignupModal";
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUs";
import ProfilePage from "./pages/ProfilePage";
import DealPage from "./pages/DealPage";
import AuthPage from "./pages/AuthPage";
import ErrorPage from "./pages/ErrorPage";
import PostDealModal from "./components/modals/PostDealModal";
import SideBarModal from "./components/modals/SideBarModal";
import NotificationModal from "./components/modals/NotificationModal";
import SearchResultsPage from "./pages/SearchResultsPage";
import { AuthContext } from "./components/AuthProvider"; // Import AuthContext

function AppLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPostDealModal, setShowPostDealModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loginReason, setLoginReason] = useState(null);
  const [loginJustSucceeded, setLoginJustSucceeded] = useState(false); // NEW
  const navigate = useNavigate();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use AuthContext instead of Firebase directly
  const { currentUser, token } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && token) {
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (loginJustSucceeded && userProfile && userProfile.username) {
      navigate(`/user/${userProfile.username}`);
      setLoginJustSucceeded(false);
    }
  }, [loginJustSucceeded, userProfile, navigate]);

  async function fetchProfile() {
    if (!token) return;
    
    try {
      const res = await fetch("https://capstone-deals-app-endpoints.vercel.app/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUserProfile(data.details);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  }

  function requireAuth(reason) {
    setLoginReason(reason);
    setShowLoginModal(true);
  }

  function handleLoginSuccess() {
    setShowLoginModal(false);
    setLoginJustSucceeded(true); // Set flag for navigation
    setLoginReason(null);
  }

  function handlePostClick() {
    if (!!userProfile) {
      setShowPostDealModal(true);
    } else {
      setLoginReason('post');
      setShowLoginModal(true);
    }
  }

  return (
    <>
      <Top searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div style={{ minHeight: "calc(100vh - 130px)" }}>
        <Routes>
          <Route path="/" element={<HomePage requireAuth={requireAuth} />} />
          {/* <Route path="/profile" element={<ProfilePage setUserProfile={setUserProfile} />} /> */}
          <Route path="/user/:username" element={<ProfilePage setUserProfile={setUserProfile} />} />
          <Route path="/deals/:deal_id" element={<DealPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/search" element={<SearchResultsPage requireAuth={requireAuth} />} />          
          <Route path="*" element={<ErrorPage />} />  
        </Routes>
      </div>
      <Bottom
        onLoginClick={() => { setLoginReason(null); setShowLoginModal(true); }}
        isLoggedIn={!!userProfile}
        avatarUrl={userProfile && userProfile.profile_pic}
        userProfile={userProfile}
        onPostClick={handlePostClick}
        onMenuClick={() => setShowSideBar(true)}
        onNotificationClick={() => setShowNotification(true)}
      />
      <SideBarModal show={showSideBar} onClose={() => setShowSideBar(false)} />
      <NotificationModal show={showNotification} onClose={() => setShowNotification(false)} />
      <LoginSignupModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <PostDealModal
        show={showPostDealModal}
        onClose={() => setShowPostDealModal(false)}
        onDealPosted={() => setShowPostDealModal(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
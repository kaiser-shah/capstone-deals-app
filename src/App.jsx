import React, { useState, useEffect } from "react";
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
import { getAuth, onAuthStateChanged } from "firebase/auth";

function AppLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPostDealModal, setShowPostDealModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginReason, setLoginReason] = useState(null); // 'vote', 'post', or null
  const navigate = useNavigate();
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (user) {
        fetchProfile(user);
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchProfile(user) {
    try {
      const token = await user.getIdToken();
      const res = await fetch("https://deal-app-backend.vercel.app/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUserProfile(data.details);
    } catch (err) {}
  }

  function requireAuth(reason) {
    setLoginReason(reason);
    setShowLoginModal(true);
  }

  function handleLoginSuccess() {
    const auth = getAuth();
    if (auth.currentUser) {
      fetchProfile(auth.currentUser);
    }
    setShowLoginModal(false);
    if (loginReason === 'vote') {
      setLoginReason(null); // Stay on HomePage
    } else if (loginReason === 'post') {
      setLoginReason(null);
      setShowPostDealModal(true);
    } else {
      navigate('/profile');
    }
  }

  function handlePostClick() {
    if (!!userProfile) {
      setShowPostDealModal(true);
    } else {
      setLoginReason('post');
      setShowLoginModal(true);
    }
  }

  if (!authReady) return null;

  return (
    <>
      <Top />
      <div style={{ minHeight: "calc(100vh - 130px)" }}>
        <Routes>
          <Route path="/" element={<HomePage requireAuth={requireAuth} />} />
          <Route path="/profile" element={<ProfilePage setUserProfile={setUserProfile} />} />
          <Route path="/deal/:deal_id" element={<DealPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<ErrorPage />} />  
        </Routes>
      </div>
      <Bottom
        onLoginClick={() => { setLoginReason(null); setShowLoginModal(true); }}
        isLoggedIn={!!userProfile}
        avatarUrl={userProfile && userProfile.profile_pic}
        onPostClick={handlePostClick}
        onMenuClick={() => setShowSideBar(true)}
        onNotificationClick={() => setShowNotification(true)}
      />
      <SideBarModal show={showSideBar} onClose={() => setShowSideBar(false)} />
      <NotificationModal show={showNotification} onClose={() => setShowNotification(false)} />
      <LoginSignupModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
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
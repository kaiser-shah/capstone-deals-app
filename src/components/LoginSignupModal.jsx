import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const BACKEND_URL = "http://localhost:3000";

export default function LoginSignupModal({ show, onClose, onLoginSuccess }) {
  const [step, setStep] = useState("email"); // 'email', 'login', 'signup'
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset modal state on close
  function handleClose() {
    setStep("email");
    setEmail("");
    setUsername("");
    setPassword("");
    setError("");
    setLoading(false);
    onClose();
  }

  // Check if user exists by email
  async function handleContinue(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/user/exists?email=${encodeURIComponent(email)}`, {
        cache: "no-store"
      });
      if (res.status !== 200 && res.status !== 304) throw new Error("Failed to check user");
      const data = await res.json();
      if (data.exists) {
        setStep("login");
      } else {
        setStep("signup");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess && onLoginSuccess();
      handleClose();
    } catch (err) {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Check if username is unique
    try {
      const usernameRes = await fetch(`${BACKEND_URL}/user/exists?username=${encodeURIComponent(username)}`);
      if (!usernameRes.ok) throw new Error("Failed to check username");
      const usernameData = await usernameRes.json();
      if (usernameData.exists) {
        setError(`The username "${username}" is already taken. Please choose another.`);
        setLoading(false);
        return;
      }
      // Username is unique, proceed with Firebase signup
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Add user to backend
      const backendRes = await fetch(`${BACKEND_URL}/addnewuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_user_id: userCredential.user.uid,
          email_verified: userCredential.user.emailVerified,
          email: userCredential.user.email,
          created_at: new Date().toISOString(),
          username: username
        })
      });

      if (!backendRes.ok) {
        const backendErr = await backendRes.json();
        setError(backendErr.error || "Failed to add user to backend.");
        setLoading(false);
        return;
      }

      onLoginSuccess && onLoginSuccess();
      handleClose();
    } catch (err) {
      setError("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Add user to backend if new
      await fetch(`${BACKEND_URL}/addnewuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_user_id: result.user.uid,
          email_verified: result.user.emailVerified,
          email: result.user.email,
          created_at: new Date().toISOString(),
          username: result.user.email
        })
      });
      onLoginSuccess && onLoginSuccess();
      handleClose();
    } catch (err) {
      setError("Google sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      animation={true}
      dialogClassName="login-signup-modal"
      contentClassName="border-0"
      backdropClassName="modal-backdrop-dark"
      style={{ zIndex: 2000 }}
    >
      <Modal.Body style={{ borderRadius: "24px 24px 0 0", padding: 32, background: "#fff", minHeight: 400 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span style={{ fontWeight: 700, fontSize: 22 }}>Login or Signup</span>
          <i className="bi bi-x-lg" style={{ fontSize: 24, cursor: "pointer" }} onClick={handleClose}></i>
        </div>
        <div className="mb-2" style={{ color: '#888' }}>Join the world's largest deal community today!</div>
        <Form onSubmit={step === "email" ? handleContinue : step === "login" ? handleLogin : handleSignup}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="john@smith.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={step !== "email"}
              required
            />
          </Form.Group>
          {step === "signup" && (
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </Form.Group>
          )}
          {step !== "email" && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>
          )}
          {error && <div className="text-danger mb-2">{error}</div>}
          <Button
            type="submit"
            className="w-100 rounded-pill fw-bold"
            style={{ background: '#e53935', border: 'none', fontSize: 18, marginBottom: 12 }}
            disabled={loading}
          >
            {step === "email" ? "Continue" : step === "login" ? "Log in" : "Sign up"}
          </Button>
        </Form>
        <div className="d-flex flex-column gap-2 mt-2">
          <Button variant="outline-secondary" className="w-100 rounded-pill d-flex align-items-center justify-content-center" onClick={handleGoogleLogin} disabled={loading}>
            <i className="bi bi-google me-2" /> Continue with Google
          </Button>
          <Button variant="outline-secondary" className="w-100 rounded-pill d-flex align-items-center justify-content-center" disabled>
            <i className="bi bi-apple me-2" /> Continue with Apple
          </Button>
          <Button variant="outline-secondary" className="w-100 rounded-pill d-flex align-items-center justify-content-center" disabled>
            <i className="bi bi-facebook me-2" /> Continue with Facebook
          </Button>
        </div>
      </Modal.Body>
      <style>{`
        .login-signup-modal .modal-dialog {
          position: fixed;
          bottom: 0;
          margin: 0 auto;
          left: 0;
          right: 0;
          width: 100vw;
          max-width: 420px;
          border-radius: 24px 24px 24px 24px;
        }
        .modal-backdrop-dark {
          background: rgba(0,0,0,0.5) !important;
        }
      `}</style>
    </Modal>
  );
} 
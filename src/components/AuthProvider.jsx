import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null); // add token state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check session expiry
                const loginTimestamp = localStorage.getItem("loginTimestamp");
                const now = Date.now();
                if (loginTimestamp && now - parseInt(loginTimestamp, 10) > 24 * 60 * 60 * 1000) {
                    // Session expired
                    await signOut(auth);
                    localStorage.removeItem("loginTimestamp");
                    setCurrentUser(null);
                    setToken(null);
                    setLoading(false);
                    return;
                }
                setCurrentUser(user);
                const userToken = await user.getIdToken();
                setToken(userToken);
                // If no timestamp, set it now (for first login)
                if (!loginTimestamp) {
                    localStorage.setItem("loginTimestamp", now.toString());
                }
            } else {
                setCurrentUser(null);
                setToken(null);
                localStorage.removeItem("loginTimestamp");
            }
            setLoading(false);
        });
    }, []);

    // Call this after successful login/signup
    function setLoginTimestamp() {
        localStorage.setItem("loginTimestamp", Date.now().toString());
    }

    const value = { currentUser, token, setLoginTimestamp };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const[currentUser, setCurrentUser] = useState(null);
    const[token, setToken] = useState(null); // add token state
    const[loading, setLoading] = useState(true)

useEffect(()=> {
    return auth.onAuthStateChanged(async(user) => {
        setCurrentUser(user)
        if (user) {
            // Get the token when user is authenticated
            const userToken = await user.getIdToken()
            setToken(userToken)
        } else {
            setToken(null)
        }
        setLoading(false)    
})
},[])

const value= {currentUser}

return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
);
}
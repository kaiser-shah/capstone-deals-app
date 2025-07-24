import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut  } from "firebase/auth";

export default function ProfilePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogOut = async () => {
    const auth = getAuth();
    try{
    await signOut(auth)
    alert("Signed out")
} catch (error) {
    console.error("Errorlogging out", error)
}
}
  // ...rest of your profile page code...
  return (
    <div>
      {/* Profile content here */}
      <h1>Profile Page</h1>
      <button onClick={handleLogOut}>Log Out</button>
    </div>
  );
}


export default function ProfilePage(){


    // In your React app when making API calls
const token = localStorage.getItem('firebaseToken');
fetch('/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});


    const ProfileComponent = () => {
        const url = "http://localhost:3000"
        const {currentUser, token} = useContext(AuthContext);

        const fetchProfile = async () => {
            if (!currentUser || !token) return;

            //use token for backend authentication
            const response = await fetch(`${url}/user_id`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            return data;
        };
        // use currentuser for frontend logic

        if (!currentUser) {
                return <div>Please log in</div>
            }
            return<div>Welcome {currentUser.displayName}</div>

        }
    }


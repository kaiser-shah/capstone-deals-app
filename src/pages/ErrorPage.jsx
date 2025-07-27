export default function ErrorPage() {
    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            height: "100vh" 
        }}>
            <img src="/errorlogo.png" alt="error" style={{ width: "30%", height: "auto" }} />
            <h2 style={{ 
                textAlign: "center", 
                fontSize: 24, 
                fontWeight: 600, 
                color: "#e53935",
                marginTop: "20px"
            }}>
                Oops! Something went wrong. Please try again later.
            </h2>
        </div>
    )
}
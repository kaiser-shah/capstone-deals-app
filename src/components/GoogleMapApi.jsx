import { useEffect, useRef, useState } from 'react';

export default function MapComponent() {
    const mapRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const officeLocation = { lat: 3.0459150088535387, lng: 101.6212665870524 };
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-fallback-key';

    useEffect(() => {
        loadGoogleMapsAPI();
        
        // Cleanup function
        return () => {
            // Optional: cleanup if needed when component unmounts
        };
    }, []);

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            initMap();
        }
    }, [isLoaded]);

    const loadGoogleMapsAPI = () => {
        // Check if Google Maps API is already fully loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            if (isLoading) return; // Prevent multiple loading attempts
            
            setIsLoading(true);
            // Wait for existing script to load
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkLoaded);
                    setIsLoaded(true);
                    setIsLoading(false);
                }
            }, 100);
            return;
        }

        // Load the script for the first time
        setIsLoading(true);
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            setIsLoaded(true);
            setIsLoading(false);
        };
        
        script.onerror = () => {
            console.error('Failed to load Google Maps API');
            setIsLoading(false);
        };
        
        document.head.appendChild(script);
    };

    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 15,
            center: officeLocation,
            mapTypeId: 'roadmap'
        });

        // Create marker with info window
        const marker = new window.google.maps.Marker({
            position: officeLocation,
            map: map,
            title: "Our Office",
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
            }
        });

        // Optional: Add info window with clickable link
        const infoWindow = new window.google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; min-width: 220px;">
                    <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Sigma School</h3>
                    <p style="margin: 0 0 15px 0; color: #666; line-height: 1.4;">
                        B-1-11, IOI Boulevard, <br> 
                        Jalan Kenari 5, 47100 <br>
                        Puchong, Selangor
                    </p>
                    <div style="display: flex; gap: 8px;">
                        <a href="https://maps.app.goo.gl/MXgE2QVDf2FoVSAx7" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="
                               flex: 1;
                               display: inline-block;
                               background-color: #1a73e8;
                               color: white;
                               padding: 8px 12px;
                               text-decoration: none;
                               border-radius: 4px;
                               font-size: 13px;
                               text-align: center;
                               font-weight: 500;
                           ">
                            📍 View on Maps
                        </a>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=3.0459150088535387,101.6212665870524" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="
                               flex: 1;
                               display: inline-block;
                               background-color: #34a853;
                               color: white;
                               padding: 8px 12px;
                               text-decoration: none;
                               border-radius: 4px;
                               font-size: 13px;
                               text-align: center;
                               font-weight: 500;
                           ">
                            🧭 Get Directions
                        </a>
                    </div>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    };

    // Show loading state
    if (isLoading) {
        return (
            <div style={{ 
                height: '400px', 
                width: '80vw', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px'
            }}>
                <p>Loading map...</p>
            </div>
        );
    }

    return (
        <div 
            ref={mapRef} 
            style={{ 
                height: '400px', 
                width: '80vw',
                border: '1px solid #ddd',
                borderRadius: '4px'
            }} 
        />
    );
}
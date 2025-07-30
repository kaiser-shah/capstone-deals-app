import { useEffect, useRef, useState } from 'react';
import GoogleMapApi from '../components/GoogleMapApi';


export default function AboutUs() {

const profilePic = '/Me_B&W_circle.jpeg';
    return (
        <div>
            <h2 style={{ marginTop: '75px', marginLeft: '30px' }}>About Me (Not “Us”... yet 😅)</h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
            src={profilePic} alt="Profile" 
            style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                border: '1px solid #F00', 
                marginTop: '15px', 
                justifyContent: 'center', 
                alignItems: 'center' }} />
            </div>
            <div style={{ marginLeft: '30px', marginRight: '30px', marginTop: '30px' }}>
                <p>
                Well, let’s be real—this is more of an About Me than an About Us because, at the moment, 
                it’s just me running, designing, managing, and testing this whole web app. Yup, I wear all the hats! 🎩
                </p>
                <p>
                I’m a software engineer who loves building products that make life easier 
                (and hopefully more fun!). One day, around mid-2025, I thought—hey, why not gather all the best deals, 
                online or in-store, and put them in one place? And thus, Syok Sale Sifu was born! 
                (Yes, I’m calling myself a sifu… because why not?)
                </p>
                <p>
                My goal is to turn this into a community-led platform where everyone can share and 
                discover awesome deals that might otherwise go unnoticed. After all, hunting for bargains 
                is way better when we do it together!
                </p>
                <p>
                This is just the beginning—I’m constantly working to grow this web app and bring you 
                even more exciting offers and features. So… stay tuned, watch this space, 
                and let’s build something amazing together! 🎉
                </p>
                
            </div>
            <div style={{ marginTop: '30px', marginLeft: '30px', marginRight: '30px', marginBottom: '65px' }}> 
                <h3>Come Find Me!</h3>
            <GoogleMapApi />
            </div>
        </div>
        
    )
}
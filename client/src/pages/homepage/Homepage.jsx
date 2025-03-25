import { Link } from 'react-router-dom'
import './homepage.css'
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const Homepage = () => {

    // const { getToken } = useAuth(); // Get Clerk token

    // const test = async () => {
    //     try {
    //         const token = await getToken(); // Get the authentication token

    //         const response = await fetch("http://localhost:3000/api/test", {
    //             method: "GET",
    //             credentials: "include",
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "application/json",
    //             },
    //         });

    //         const data = await response.text();
    //         console.log("Response:", data);
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    const [typingStatus, setTypingStatus] = useState("human1");

    return (
        <div className='homepage'>
            <img src="/orbital.png" alt="" className="orbital" />
            <div className="left">
                <h1> Aditya's AI Assistant </h1>
                <h2> Hello Aditya, Ready to Chat? </h2>
                <h3>Ask me anything! Your conversations stay private with me. 🤖</h3>
                <Link to="/dashboard">Get Started</Link>
                {/* <button onClick={test}> TEST BACKEND AUTH </button> */}
            </div>
            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg"></div>
                    </div>
                    <img src="/bot.png" alt="" className="bot" />
                    <div className="chat">
                        <img src={
                        typingStatus === "human1"
                        ? "footballEDITED.jpg"
                        : typingStatus === "human2"
                        ? "/rainbow.JPG"
                        : "bot.png"
                         }
                                alt='' />
                        <TypeAnimation
                            sequence={[
                            // Same substring at the start will only be typed out once, initially
                            "Aditya: Lets talk about Football!",
                            1000,
                            () => {
                                setTypingStatus("bot");
                            },
                            "AI: Lets do that! What's your favorite football team?",
                            1000,
                            () => {
                                setTypingStatus("human2");
                            },
                            "Messi: I want to join the conversation",
                            1000,
                            () => {
                                setTypingStatus("bot");
                            },
                            "AI: Sure! Ask me anything.",
                            1000,
                            () => {
                                setTypingStatus("human1");
                            },
                            ]}
                            wrapper="span"
                            repeat={Infinity}
                            cursor={true}
                            omitDeletionAnimation={true}
                        />
                    </div>         
                </div>
            </div>
            <div className="terms">
                <img src="/logo.png" alt="" />
                <div className="links">
                    <Link to="/">Terms of Service</Link>
                    <span>|</span>
                    <Link to="/">Privacy Policy</Link>
                </div>
            </div>
        </div>
    )
}

export default Homepage
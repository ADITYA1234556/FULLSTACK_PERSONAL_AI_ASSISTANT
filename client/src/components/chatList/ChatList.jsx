import './chatList.css'
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const ChatList = () => {
    const { getToken } = useAuth();

    const { isPending, error, data } = useQuery({
        queryKey: ["userChats"],
        queryFn: async () => {
            const token = await getToken(); // Get Clerk token
            // console.log("🔑 Clerk Token:", token); // Debug log

            return fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`, // Send token
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                // console.log("📝 Response Status:", res.status); // Debugging
                return res.json();
            });
        },
    });
    return (
        <div className='chatList'>
            <span className="title">DASHBOARD</span>
            <Link to="/dashboard">Create a new Chat</Link>
            <Link to="/">Explore Aditya's AI</Link>
            <Link to="/">Contact</Link>
            <hr />
            <span className="title">RECENT CHATS</span>
            <div className="list">
                {isPending
                    ? "Loading..."
                    : error
                    ? "Something went wrong!"
                    : data?.map((chat) => (
                        <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                        {chat.title}
                        </Link>
                ))}
            </div>
            <hr />
            <div className="upgrade">
                <img src="/logo.png" alt="" />
                <div className="texts">
                <span>Upgrade to Aditya's AI Pro</span>
                <span>Get unlimited access to all features</span>
                </div>
            </div>
        </div>
    )
}

export default ChatList
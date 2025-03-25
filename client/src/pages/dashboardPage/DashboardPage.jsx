import { use } from 'react';
import './dashboardPage.css'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {useAuth} from "@clerk/clerk-react";

const DashboardPage = () => {

    const queryClient = useQueryClient();
    const { getToken } = useAuth(); // Clerk's function to get the token

    const mutation = useMutation({
        mutationFn: async (text) => {
            const token = await getToken(); // Get Clerk session token
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Send Clerk token
                },
                body: JSON.stringify({ text }),
            }).then((res) => res.json());
        },
        onSuccess: (id) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["userChats"] });
            navigate(`/dashboard/chats/${id}`);
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;
        mutation.mutate(text);
    };

    const navigate = useNavigate();

    return (
        <div className='dashboardPage'>
            <div className="texts">
                <div className="logo">
                    <img src="/logo.png" alt="" />
                    <h1>Aditya's Personal AI</h1>
                </div>
                <div className="options">
                    <div className="option">
                        <img src="/chat.png" alt="" />
                        <span>Create a New Chat</span>
                    </div>
                    <div className="option">
                        <img src="/image.png" alt="" />
                        <span>Analyze Images</span>
                    </div>
                    <div className="option">
                        <img src="/code.png" alt="" />
                        <span>Help me with my Code</span>
                    </div>
                </div>               
            </div>
            <div className='askai'>
                    <h2>What can I help with?</h2>
            </div>
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <input type="text" name="text" placeholder="Ask me anything..." />
                    <button>
                        <img src="/arrow.png" alt="" />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default DashboardPage
import NewPrompt from '../../components/newPrompt/NewPrompt';
import './chatPage.css'
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from 'react-router-dom';
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

const ChatPage = () => {

    const path = useLocation().pathname;
    const chatId = path.split("/").pop();

    const { getToken } = useAuth();
    
    const { isPending, error, data } = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const token = await getToken(); // Get Clerk token
            // console.log("🔑 Clerk Token:", token); // Debug log

            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
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
    
    console.log(data);
    return (
        <div className='chatPage'>
            <div className="wrapper">
                <div className="chat">
                    {isPending
                    ? "Loading..."
                    : error
                    ? "Something went wrong!"
                    : data?.history?.map((message, i) => (
                        <>
                        {message.img && (
                            <IKImage
                            // TO GET THE IMAGE FROM IMAGE KIT URL.PATH SIZE
                                urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                                path={message.img}
                                height="300"
                                width="400"
                                transformation={[{ height: 300, width: 400 }]}
                                loading="lazy"
                                lqip={{ active: true, quality: 20 }}
                            />
                        )}
                        <div className={ message.role === "user" ? "message user" : "message" } key={i}>
                            <Markdown>
                                {message.parts[0].text}
                            </Markdown>
                        </div>
                        </>
                        ))}
                    {data && <NewPrompt data={data}/>}
                </div>
            </div>
        </div>
    )
}

export default ChatPage
import "./newPrompt.css";
import { useEffect, useRef, useState } from "react"
import Upload from "../upload/Upload"
import { IKImage } from "imagekitio-react";
import model from "../../googleapi/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {useAuth} from "@clerk/clerk-react";

const NewPrompt = ({ data }) => {

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
      });

    // TO KEEP THE HISTORY OF THE CHAT
    const chat = model.startChat({
    history: [
        {
            role: "model",
            parts: [{ text: "Hello! I'm here to help you with your queries. Ask me anything." }],
            role: "user",
            parts: [{ text: "Hello! Can you help me with my query?"  }]
        },
    ],
    generationConfig: {
        // maxOutputTokens: 100,
    },
    });

    const endRef = useRef(null)

    // TO RESET INPUT CHAT BOX
    const formRef = useRef(null);

    useEffect(() => {
        if (endRef.current) {  
            endRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [data, question, answer, img.dbData]);

    const queryClient = useQueryClient();
    const { getToken } = useAuth(); // Clerk's function to get the token

    const mutation = useMutation({
        mutationFn: async () => {
            const token = await getToken(); // Get Clerk session token
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Send Clerk token
                },
                body: JSON.stringify({ question: question.length 
                    ? question : undefined, answer, img: img.dbData?.filePath || undefined, }),
            }).then((res) => res.json());
        },
        onSuccess: (id) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["chat", data._id] })
            // make empty string of question and answer and image
            .then(() => {
                formRef.current.reset();
                setQuestion("");
                setAnswer("");
                setImg({
                  isLoading: false,
                  error: "",
                  dbData: {},
                  aiData: {},
                });
              });
        },
        onError: (err) => {
            console.log(err);
          },
    });

    const add = async (text, isInitial) =>{
        if (!isInitial) setQuestion(text);

        try {   
        // CHANGE GENERATE CONTENT TO CHAT.sendMessage TO RETAIN THE HISTORY.
        const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);
        // const response = await result.response;
        let accumulatedText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            console.log(chunkText);
            accumulatedText += chunkText;
            setAnswer(accumulatedText);
        }
        mutation.mutate();
        } catch (err) {
        console.log(err);
        }
        // setAnswer(response.text()); REPLACING WITH MUTATE FUNCTION
        // setImg({
        //     isLoading: false,
        //     error: "",
        //     dbData: {},
        //     aiData: {} 
        // });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const text = e.target.text.value;
        if (!text) return;

        add(text, false);
        
    }

    
    const hasRun = useRef(false);
    
    // IF ONLY ONE QUESTION IT IS FROM THE USER FIRST MESSAGE IN CHAT, SO MARK IT WITH PARTS[0] THAT IS USER
    useEffect(() => {
    if (!hasRun.current) {
        if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
        }
    }
    hasRun.current = true;
    }, []);

    return (
        <>
        {/* To show Loading... till image is completely uploaded to imagekit */}
        {img.isLoading && <div className="">Loading...</div>}
        {/* To show the image on the chat once uploaded */}
        {img.dbData?.filePath && (
                <IKImage
                  urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                  path={img.dbData?.filePath}
                  width="380"
                  transformation={[{ width: 380 }]}
                />
        )}
        {question && <div className="message user">{question}</div>}
        {answer && <div className="message"><Markdown>{answer}</Markdown></div>}
        <div className="endChat" ref={endRef}></div>
            <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg}/>
                <input type="file" id="file" multiple={false} hidden/>
                <input type="text" name="text" placeholder="Ask anything..." />
                <button>
                    <img src="/arrow.png" alt="" />
                </button>
            </form>
        </>
    )
}

export default NewPrompt
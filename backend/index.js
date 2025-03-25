import express from 'express';
import ImageKit from "imagekit";
import cors from 'cors';
import mongoose from 'mongoose';
import Chat from './models/chat.js';
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// TO ACCEPT JSON DATA FROM BACKEND
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

/* CREATE INSTANCE OF IMAGEKIT*/
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

// REST API METHODS

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  });

// TEST CLERK MIDDLEWARE
// app.get("/api/test", ClerkExpressRequireAuth(), (req, res) => {
//   console.log("REQ.AUTH:", req.auth.userId); // Log the authentication object

//   if (!req.auth || !req.auth.userId) {
//     return res.status(401).send("Unauthenticated: No valid Clerk token found.");
//   }

//   res.send(`Authenticated as user: ${req.auth.userId}`);
// });

// ASK A QUESTION AND CREATE A CHAT
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  console.log("REQ.AUTH:", req.auth); // Debugging log
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Unauthenticated: No valid Clerk token found." });
    }

  const userId = req.auth.userId;
  const { text } = req.body;
  console.log("Received Message:", text);
  try {
    // CREATE A NEW CHAT
    const newChat = new Chat ({
      userId: userId,
      history: [{role: "user", parts: [{text}] }],
    });
    const savedChat = await newChat.save();

    // CHECK IF USER CHAT EXISTS
    const userChats = await UserChats.find({userId: userId});

    // IF USERCHAT DOESNT EXIST CREATE A NEW CHAT AND ADD IT IN CHATS ARRAY
    if(!userChats.length)
      {
      // IF NOT CREATE A NEW USER CHAT
      const newUserChats = new UserChats({
        userId: userId,
        chats: [{_id: savedChat._id, title: text.substring(0,40),},], 
        // Substring so that the chat title will be named with first 40 characters rather than big text
      });
      await newUserChats.save();
      } else{
        // IF USERCHAT EXISTS ADD THE CHAT TO THE CHATS ARRAY
        await UserChats.updateOne(
          {userId: userId},
          {$push:{chats:{
            _id: savedChat._id,
            title: text.substring(0,40),
          },},},
        );
        res.status(201).send(newChat._id);
      }
    }catch(err){
    console.log(err);
    response.status(500).send("Error creating chat");
  }
});

// GET USER CHATS ACCORDING TO USER ID
app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  // console.log("REQ.AUTH:", req.auth); // Debugging log

  if (!req.auth || !req.auth.userId) {
      console.error("❌ Clerk Authentication Failed!");
      return res.status(401).json({ error: "Unauthorized: Clerk token missing or invalid." });
  }

  const userId = req.auth.userId;
  // console.log("✅ User ID:", userId); // Debugging log

  try {
      const userChats = await UserChats.find({ userId });
      // console.log("✅ Found Chats:", userChats); // Debugging log

      res.status(200).json(userChats[0]?.chats || []);
  } catch (err) {
      console.error("❌ Error fetching user chats:", err);
      res.status(500).json({ error: "Error fetching user chats!" });
  }
});

// GET SINGLE CHAT BY ID
app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  if (!req.auth || !req.auth.userId) {
    console.error("❌ Clerk Authentication Failed!");
    return res.status(401).json({ error: "Unauthorized: Clerk token missing or invalid." });
  }
  const userId = req.auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

// TO WRITE IN EXISTING CHAT
app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  if (!req.auth || !req.auth.userId) {
    console.error("❌ Clerk Authentication Failed!");
    return res.status(401).json({ error: "Unauthorized: Clerk token missing or invalid." });
  }
  const userId = req.auth.userId;

  // GET QUESTION, IMAGE AND ANSWER FROM BODY
  const { question, answer, img } = req.body;

  const newItems = [
    ...(question // IF THERE IS A QUESTION SEND USER MESSAGE
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []), // IF NO QUESTION, SEND EMPTY ARRAY
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems, // TAKE QUESTIONS FROM USER AND ANSWERS FROM MODEL
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});

// CLERK ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`);
});


import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema(
    // INSIDE THE CHAT LETS HAVE USER ID TITLE AND CREATED AT FOR STORING IN DATABASE
    {
    userId: { type: String, required: true},
    chats: [{ 
        _id: { type: String, required: true,},
        title: { type: String, required: true,},
        createdAt: { type: Date, default:Date.now()},
    }],
    }, 
    { timestamps: true } );

export default mongoose.models.userchats || mongoose.model("userchats", userChatsSchema);
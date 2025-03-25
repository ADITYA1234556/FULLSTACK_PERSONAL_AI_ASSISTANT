import { Outlet, useNavigate } from 'react-router-dom'
import './dashboardLayout.css'
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatList from "../../components/chatList/ChatList"


const DashboardLayout = () => {

    const { userId, isLoaded } = useAuth();

    const navigate = useNavigate();

    // IF PAGE LOADED AND NO USED ID MEANS NOT LOGGED IN SO WE USE NAVIGATE TO SEND THE REQUEST TO SIGN IN PAGE
    useEffect(() => {
        if (isLoaded && !userId) {
          navigate("/sign-in");
        }
      }, [isLoaded, userId, navigate]);
    
      if (!isLoaded) return "Loading...";

    return (
        <div className='dashboardLayout'>
            <div className='menu'><ChatList /></div>
            <div className='content'>
                <Outlet />
            </div>
        </div>
    )
}

export default DashboardLayout
import axios from "axios";
import { useEffect, useState } from "react";
import { createSocketConnection } from "../../utils/socket";
import { BASE_URL } from "../../utils/constants";


const useOnlineStatus = () => {
    const [onlineStatuses, setOnlineStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchOnlineStatus = async () => {
      try {
        const response = await axios.get(BASE_URL + '/user/online-status', {
            withCredentials: true,
        });
        console.log(response?.data?.data);
        setOnlineStatuses(response?.data?.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch online status', error);
        setLoading(false);
      }
    };
  
    useEffect(() => {
        // Initial fetch
        fetchOnlineStatus();
    
        // Socket for real-time updates
        const socket = createSocketConnection();
        socket.on('userStatusUpdated', ({ userId, status }) => {
            setOnlineStatuses(prevStatuses => prevStatuses.map(user => 
                    user.userId === userId ? { ...user, isOnline: status === "online" } : user
            ));
        });
    
        // Periodic refresh
        // const intervalId = setInterval(fetchOnlineStatus, 10000 * 60 * 3);
    
        return () => {
            socket.disconnect();
            // clearInterval(intervalId);
        };
    }, []);
  
    const isUserOnline = (userId) => {
      return onlineStatuses.find(
        status => status.userId.toString() === userId.toString() && status.isOnline
      );
    };
    
    return { onlineStatuses, isUserOnline, loading };
};

export default useOnlineStatus;
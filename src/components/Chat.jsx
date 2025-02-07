import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { formatDistanceToNow } from "date-fns";
import useOnlineStatus from "./hooks/useOnlineStatus";
import axios from "axios";


const Chat = () => {
    const { targetUserId } = useParams();
    const chatEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [targetFullName, setTargetFullName] = useState("");
    const user = useSelector((store) => store.user);
    const userId = user?._id;
    const { isUserOnline, loading } = useOnlineStatus();
    const socket = useRef(null);
    const [page, setPage] = useState(1);

    if (!socket.current) {
        socket.current = createSocketConnection();
    }
    socket.current.emit('userConnected', userId);

    const fetchChatMessages = async () => {
        console.log("fettch");
        const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}?page=${page}&limit=10`, {
            withCredentials: true,
        });
        console.log(chat);
        setTargetFullName(chat?.data?.targetUser);

        const chatMessages = chat?.data?.chat.map((msg) => {
            const { senderId, text, updatedAt } = msg;
            return {
                firstName: senderId?.firstName,
                lastName: senderId?.lastName,
                time: updatedAt,
                text,
            };
        });
        // setMessages(chatMessages);
        setMessages((prev) => [...chatMessages, ...prev]);
    };

    // Load more messages when scrolling to top
    const handleScroll = (e) => {
        if (e.target.scrollTop === 0) {
            setPage((prev) => prev + 1); // Load next page
        }
    };

    useEffect(() => {
        fetchChatMessages();
    }, []);

    useEffect(() => {
        if (!userId) return;

        // const socket = createSocketConnection();
        if (!socket.current) {
            socket.current = createSocketConnection();
        }

        socket.current.emit("joinChat", {
            firstName: user.firstName,
            userId,
            targetUserId,
        });

        socket.current.on("messageReceived", ({ firstName, lastName, text }) => {
            setMessages((messages) => [...messages, { firstName, lastName, text }]);
        });

        socket.current.emit('userConnected', userId);

        return () => {
            // socket.disconnect();
            socket.current.disconnect();
            socket.current = null;
        };
    }, [userId, targetUserId]);

    const sendMessage = () => {
        if (!socket.current) {
            socket.current = createSocketConnection();
        }
        socket.current.emit("sendMessage", {
            firstName: user.firstName,
            lastName: user.lastName,
            userId,
            targetUserId,
            text: newMessage,
        });
        setNewMessage("");
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
    };

    return (
        <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
            <h1 className="p-5 border-b border-gray-600">
                {targetFullName}
                {!loading && isUserOnline(targetUserId) ? ' 🟢 Online' : ' 🔴 Offline'}
            </h1>
            <div className="flex-1 overflow-scroll p-5" onScroll={handleScroll}>
                {messages.map((msg, index) => {
                    return (
                        <div
                            key={index}
                            className={
                                "chat " +
                                (user.firstName === msg.firstName ? "chat-end" : "chat-start")
                            }
                            >
                            <div className="chat-header">
                                {`${msg.firstName}  ${msg.lastName}`}
                                <time className="text-xs opacity-50">
                                    {" "}
                                    {msg.time ? formatDistanceToNow(new Date(msg.time), { addSuffix: true }) : "Just now"}
                                </time>
                            </div>
                            <div className="chat-bubble">{msg.text}</div>
                            <div className="chat-footer opacity-50">Seen</div>
                        </div>
                    );
                })}
                <div ref={chatEndRef}></div>
            </div>

            <div className="p-5 border-t border-gray-600 flex items-center gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-gray-500 text-white rounded p-2"
                ></input>

                <button onClick={sendMessage} className="btn btn-secondary">Send</button>
            </div>
        </div>
    );
};

export default Chat;
import io from "socket.io-client";
import { BASE_URL } from "./constants";

let socket = null;
export const createSocketConnection = () => {
    if(socket != null) return socket;

    if (location.hostname === "localhost") {
        socket = io(BASE_URL);
    } else {
        socket = io("/", { path: "/api/socket.io" });
    }

    return socket;
};
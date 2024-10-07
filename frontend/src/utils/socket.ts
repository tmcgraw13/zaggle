import { io } from "socket.io-client";
import serverUrl from "./config";

const socket = io(serverUrl);

export default socket;

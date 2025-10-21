// lib/websocket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Inicializa a conexão WebSocket (Socket.IO)
 */
export const connectWebSocket = (namespace: string = "/") => {
    if (!socket) {
        const baseURL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // ajuste conforme o backend

        socket = io(`${baseURL}${namespace}`, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
        });

        socket.on("connect", () => {
            console.log(`✅ Conectado ao WebSocket (${namespace})`);
        });

        socket.on("disconnect", (reason) => {
            console.warn("❌ Desconectado:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("Erro de conexão WebSocket:", err.message);
        });
    }

    return socket;
};

/**
 * Retorna o socket atual (ou inicializa se ainda não existir)
 */
export const getSocket = (namespace: string = "/") => {
    if (!socket) return connectWebSocket(namespace);
    return socket;
};

/**
 * Encerra a conexão WebSocket
 */
export const disconnectWebSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

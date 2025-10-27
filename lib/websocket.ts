// lib/websocket.ts
import { io, Socket } from "socket.io-client";

const sockets: Record<string, Socket> = {};

/**
 * Inicializa ou recupera uma conexão WebSocket (com reconexão e heartbeat)
 */
export const getSocket = (namespace: string = "/"): Socket => {
  if (!sockets[namespace]) {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const socket = io(`${baseURL}${namespace}`, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000, // 1s
      reconnectionDelayMax: 5000, // até 5s
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log(`✅ Conectado ao WebSocket (${namespace})`);
    });

    socket.on("disconnect", (reason) => {
      console.warn(`❌ Desconectado (${namespace}):`, reason);
    });

    socket.on("connect_error", (err) => {
      console.error(`⚠️ Erro de conexão (${namespace}):`, err.message);
    });

    // 🔁 Heartbeat: envia ping a cada 20s pra evitar timeout no Render
    const pingInterval = setInterval(() => {
      if (socket.connected) socket.emit("ping");
    }, 20000);

    socket.on("pong", () => {
      // opcional: console.log("🏓 pong recebido");
    });

    socket.on("disconnect", () => {
      clearInterval(pingInterval);
    });

    sockets[namespace] = socket;
  }

  return sockets[namespace];
};

/**
 * Encerra a conexão WebSocket de um namespace específico
 */
export const disconnectWebSocket = (namespace: string = "/") => {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    delete sockets[namespace];
  }
};

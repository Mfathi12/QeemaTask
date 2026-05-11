import "socket.io";

declare module "socket.io" {
  interface SocketData {
    /** Set after JWT handshake middleware when valid. */
    userId?: number;
  }
}

export {};

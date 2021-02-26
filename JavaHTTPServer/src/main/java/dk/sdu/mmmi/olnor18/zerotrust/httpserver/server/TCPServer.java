package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server;

import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

public class TCPServer implements ISocketServer {
    private ServerSocket serverSocket;
    private boolean running = true;
    private FilterLayerHandler handler;

    public TCPServer(InetSocketAddress socketAddress, FilterLayerHandler handler) throws IOException {
        this.handler = handler;
        serverSocket = new ServerSocket(socketAddress.getPort(), 0, socketAddress.getAddress());
    }

    @Override
    public void stop(int i) {
        try {
            running = false;
            serverSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start() throws IOException {
        if (handler == null) throw new IOException("Handler is null");
        new Thread(() -> {
            while (running) {
                try {
                    Socket socket = serverSocket.accept();
                    new TCPSocketHandler(socket, handler).start();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
}

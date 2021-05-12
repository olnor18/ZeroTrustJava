package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.tcp;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.ISocketServer;
import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

public class TCPServer implements ISocketServer {
    private ServerSocket serverSocket;
    private boolean running = true;
    private FilterLayerHandler handler;

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
    public void setHandler(FilterLayerHandler handler) {
        this.handler = handler;
    }

    @Override
    public void start(InetSocketAddress socketAddress) throws IOException {
        this.serverSocket = new ServerSocket(socketAddress.getPort(), 0, socketAddress.getAddress());
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

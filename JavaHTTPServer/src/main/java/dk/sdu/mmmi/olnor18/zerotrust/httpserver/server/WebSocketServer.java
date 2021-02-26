package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server;

import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class WebSocketServer implements ISocketServer {
    private WebSocketConnectionHandler webSocketConnectionHandler;

    public WebSocketServer(InetSocketAddress socketAddress, FilterLayerHandler handler) throws IOException {
        webSocketConnectionHandler = new WebSocketConnectionHandler(socketAddress, handler);
    }

    @Override
    public void stop(int i) {
        try {
            webSocketConnectionHandler.stop();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start() throws IOException {
        webSocketConnectionHandler.start();
    }
}

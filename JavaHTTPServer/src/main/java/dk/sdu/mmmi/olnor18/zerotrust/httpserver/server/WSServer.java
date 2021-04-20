package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server;

import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class WSServer implements ISocketServer {
    private WSConnectionHandler wsConnectionHandler;

    public WSServer(InetSocketAddress socketAddress, FilterLayerHandler handler) throws IOException {
        wsConnectionHandler = new WSConnectionHandler(socketAddress, handler);
    }

    @Override
    public void stop(int i) {
        try {
            wsConnectionHandler.stop();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start() throws IOException {
        wsConnectionHandler.start();
    }
}

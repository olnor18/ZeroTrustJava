package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.ws;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.ISocketServer;
import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class WSServer implements ISocketServer {
    private WSConnectionHandler wsConnectionHandler;
    private FilterLayerHandler handler;

    @Override
    public void stop(int i) {
        try {
            wsConnectionHandler.stop();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void setHandler(FilterLayerHandler handler) {
        this.handler = handler;
    }

    @Override
    public void start(InetSocketAddress socketAddress) throws IOException {
        this.wsConnectionHandler = new WSConnectionHandler(socketAddress, this.handler);
        wsConnectionHandler.start();
    }
}

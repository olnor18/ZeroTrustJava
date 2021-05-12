package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections;

import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public interface ISocketServer {
    void stop(int i);
    void setHandler(FilterLayerHandler handler);
    void start(InetSocketAddress socketAddress) throws IOException;
}

package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server;

import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;

public interface ISocketServer {
    void stop(int i);

    void start() throws IOException;
}

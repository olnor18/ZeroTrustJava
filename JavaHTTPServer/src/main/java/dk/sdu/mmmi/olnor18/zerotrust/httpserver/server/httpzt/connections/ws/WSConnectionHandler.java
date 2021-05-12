package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.ws;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state.StateHandler;
import io.vacco.express.filter.FilterLayerHandler;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;

public class WSConnectionHandler extends WebSocketServer {
    public FilterLayerHandler handler;

    public WSConnectionHandler(InetSocketAddress address, FilterLayerHandler handler) {
        super(address);
        this.handler = handler;
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        webSocket.setAttachment(new StateHandler());
    }

    @Override
    public void onMessage(WebSocket webSocket, String s) {
        StateHandler stateHandler = webSocket.getAttachment();
        stateHandler.parseRequest(s, webSocket.getRemoteSocketAddress(), handler).then((action, o) ->
                webSocket.send((String) o)
        );
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        //NO-OP
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        //NO-OP
    }

    @Override
    public void onStart() {
        //NO-OP
    }
}

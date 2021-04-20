package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities;

import io.vacco.express.filter.FilterLayerHandler;
import org.riversun.promise.Promise;

import java.net.InetSocketAddress;

public class StateHandler {
    private ConnectionState connectionState;

    public StateHandler() {
        this.connectionState = ConnectionState.CLEARTEXT;
    }

    public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler){
        Promise response = this.connectionState.parseRequest(request, socketAddress, handler).then((action, o) -> {
            this.connectionState = ((ConnectionState) ((Object[])o)[1]).update();
            action.resolve(((Object[])o)[0]);
        });
        return response;
    }
}

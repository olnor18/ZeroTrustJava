package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state;

import io.vacco.express.filter.FilterLayerHandler;
import org.riversun.promise.Promise;

import java.net.InetSocketAddress;

public class CleartextState extends ConnectionState {
    @Override
    public void setKey(String key) {
        this.key = key;
    }

    @Override
    public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
        return handeRequest(request, socketAddress, this, handler);
    }

    @Override
    public ConnectionState update() {
        if (key != null) {
            ConnectionState state = new NegotiatingState();
            state.setKey(key);
            return state;
        }
        return this;
    }
}

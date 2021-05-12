package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state;

import io.vacco.express.http.RawHttpExchange;
import io.vacco.express.filter.FilterLayerHandler;
import org.riversun.promise.Promise;
import rawhttp.core.RawHttp;
import rawhttp.core.RawHttpRequest;

import java.net.InetSocketAddress;

public abstract class ConnectionState {
    protected String key;

    public abstract Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler);

    public abstract void setKey(String key);

    public abstract ConnectionState update();

    protected static Promise handeRequest(
            String request,
            InetSocketAddress socketAddress,
            ConnectionState connectionState,
            FilterLayerHandler handler
    ) {
        if (request.isEmpty()) return Promise.reject("Request is empty");
        RawHttpRequest rawHttpRequest = new RawHttp().parseRequest(request);
        return Promise.resolve().then((action, o) -> {
            RawHttpExchange rawHttpExchange = new RawHttpExchange(
                    rawHttpRequest,
                    socketAddress,
                    connectionState,
                    action
            );
            handler.handle(rawHttpExchange);
        }).start();
    }
}

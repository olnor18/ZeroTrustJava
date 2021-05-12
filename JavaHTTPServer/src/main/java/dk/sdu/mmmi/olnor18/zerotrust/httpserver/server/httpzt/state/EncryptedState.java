package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.utilities.Encryptor;
import io.vacco.express.filter.FilterLayerHandler;
import org.riversun.promise.Promise;

import java.net.InetSocketAddress;

public class EncryptedState extends ConnectionState{
    @Override
    public void setKey(String key) {
        this.key = key;
    }

    @Override
    public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
        if (request.isEmpty()) return Promise.reject("Request is empty");
        String requestDecoded = Encryptor.decryptMessage(request, this.key);
        if (requestDecoded == null) {
            return Promise.reject().then((action, o) -> action.reject("Invalid request")).start();
        }
        return handeRequest(requestDecoded, socketAddress, this, handler).then((action, o) ->
                action.resolve(new Object[]{Encryptor.encryptMessage((String)((Object[])o)[0], this.key), this})
        );
    }

    @Override
    public ConnectionState update() {
        return this;
    }
}

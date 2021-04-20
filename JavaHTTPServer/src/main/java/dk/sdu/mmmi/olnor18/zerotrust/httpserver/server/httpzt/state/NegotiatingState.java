package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.Encryptor;
import io.vacco.express.filter.FilterLayerHandler;
import org.riversun.promise.Promise;

import java.net.InetSocketAddress;

public class NegotiatingState extends ConnectionState {
    private boolean valid = false;

    @Override
    public void setKey(String key) {
        this.key = key;
    }

    @Override
    public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
        String decryptedMessage = Encryptor.decryptMessage(request, this.key);
        if (decryptedMessage != null && decryptedMessage.equals("ACK")) {
            this.valid = true;
            return Promise.resolve().then((action, o) ->
                    action.resolve(new Object[]{Encryptor.encryptMessage("SYNACK", this.key), this})
            ).start();
        }
        return Promise.reject().then((action, o) -> action.reject("Invalid ACK")).start();
    }

    @Override
    public ConnectionState update() {
        if (valid) {
            ConnectionState state = new EncryptedState();
            state.setKey(key);
            return state;
        } else {
            return this;
        }
    }
}

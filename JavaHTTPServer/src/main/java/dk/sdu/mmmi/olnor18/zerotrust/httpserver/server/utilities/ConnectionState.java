package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.Encryptor;
import io.vacco.express.filter.FilterLayerHandler;
import jdk.jshell.spi.ExecutionControl;
import org.riversun.promise.Promise;
import rawhttp.core.RawHttp;
import rawhttp.core.RawHttpRequest;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Optional;

public enum ConnectionState {
    /*NOT_UPGRADED {
        private String key;
        @Override
        ConnectionState handleRequest(String request, Socket socket, FilterLayerHandler handler) throws IOException {
            RawHttpRequest rawHttpRequest = new RawHttp().parseRequest(request);
            RawHttpExchange rawHttpExchange = new RawHttpExchange(rawHttpRequest, socket, this);
            if (!rawHttpRequest.getHeaders().contains("Upgrade")){
                rawHttpExchange.sendResponseHeaders(405, 0);
                rawHttpExchange.close();
                return NOT_UPGRADED;
            }
            Optional<String> key = rawHttpRequest.getHeaders().getFirst("Sec-WebSocket-Key");
            if (!key.isPresent()) {
                rawHttpExchange.sendResponseHeaders(405, 0);
                rawHttpExchange.close();
                return NOT_UPGRADED;
            }
            this.key = key.get();
            rawHttpExchange.getResponseHeaders().add("Upgrade", "websocket");
            rawHttpExchange.getResponseHeaders().add("Connection", "Upgrade");
            try {
                rawHttpExchange.getResponseHeaders().add("Sec-WebSocket-Accept", Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-1").digest((this.key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes(StandardCharsets.UTF_8))));
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }
            rawHttpExchange.sendResponseHeaders(101, 0);
            rawHttpExchange.close();
            return CLEARTEXT;
        }

        @Override
        void sendRequest(String request, Socket socket) throws IOException {
            System.out.println(this.key);
            //Do websocket encoding with key
            socket.getOutputStream().write(request.getBytes());
            socket.getOutputStream().flush();
        }
    },*/
    CLEARTEXT {
        private String key;

        @Override
        public void setKey(String key){
            this.key = key;
        }

        @Override
        public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
            return handeRequest(request, socketAddress, this, handler);
        }

        @Override
        public ConnectionState update() {
            if (key != null) {
                ConnectionState state = NEGOTIATING;
                state.setKey(key);
                return state;
            }
            return this;
        }
    },
    NEGOTIATING {
        private String key;
        private boolean valid = false;

        @Override
        public void setKey(String key){
            this.key = key;
        }

        @Override
        public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
            if (Encryptor.decryptMessage(request, this.key) == "ACK") {
                return Promise.resolve(Encryptor.encryptMessage("SYNACK", this.key));
            }
            return Promise.reject("Invalid ACK");
        }

        @Override
        public ConnectionState update() {
            if (valid) {
                ConnectionState state = ENCRYPTED;
                state.setKey(this.key);
                return state;
            } else {
                return this;
            }
        }
    },
    ENCRYPTED {
        private String key;

        @Override
        public void setKey(String key){
            this.key = key;
        }

        @Override
        public Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler) {
            if (request.isEmpty()) return Promise.reject("Request is empty");
            String requestDecoded = Encryptor.decryptMessage(request, this.key);
            return handeRequest(requestDecoded, socketAddress, this, handler).then((action, o) ->
                action.resolve(Encryptor.encryptMessage((String) o, this.key))
            );
        }

        @Override
        public ConnectionState update() {
            return this;
        }
    };

    public abstract Promise parseRequest(String request, InetSocketAddress socketAddress, FilterLayerHandler handler);
    public abstract void setKey(String key);
    public abstract ConnectionState update();

    private static Promise handeRequest(String request, InetSocketAddress socketAddress, ConnectionState connectionState, FilterLayerHandler handler) {
        if (request.isEmpty()) return Promise.reject("Request is empty");
        RawHttpRequest rawHttpRequest = new RawHttp().parseRequest(request);
        return Promise.resolve().then((action, o) -> {
            RawHttpExchange rawHttpExchange = new RawHttpExchange(rawHttpRequest, socketAddress, connectionState, action);
            handler.handle(rawHttpExchange);
        }).start();
    }
}

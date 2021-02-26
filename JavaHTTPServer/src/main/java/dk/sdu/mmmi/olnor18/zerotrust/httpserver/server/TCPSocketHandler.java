package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.ConnectionState;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.ServerType;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.StateHandler;
import io.vacco.express.filter.FilterLayerHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

public class TCPSocketHandler extends Thread {
    private Socket socket;
    private StateHandler stateHandler;
    private FilterLayerHandler handler;

    public TCPSocketHandler(Socket socket, FilterLayerHandler handler) {
        this.handler = handler;
        this.socket = socket;
        this.stateHandler = new StateHandler();
    }

    public void run() {
        try {
            if (handler == null) throw new IOException("Handler is null");
            while (!socket.isClosed()) {
                String request = getStringFromSocket(socket);
                if (request.isEmpty()) continue;
                stateHandler.parseRequest(request, (InetSocketAddress) socket.getRemoteSocketAddress(), handler).then((action, object) -> {
                    socket.getOutputStream().write(((String) object).getBytes());
                    socket.getOutputStream().flush();
                });
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    public static String getStringFromSocket(Socket socket) throws IOException {
        byte[] buffer = new byte[1024];
        int read;
        String output = "";
        while(!socket.isClosed()) {
            if ((read = socket.getInputStream().read(buffer)) == -1 || (output = output+new String(buffer, 0, read)).endsWith("\r\n\r\n"))
                break;
        };
        return output;
    }
}

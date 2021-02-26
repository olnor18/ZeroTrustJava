package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities;

import org.riversun.promise.Action;
import org.riversun.promise.Promise;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;

public class PreprocessedStringOutputSteam extends OutputStream {
    private StringBuilder stringBuilder;
    private ConnectionState connectionState;
    private Action action;

    public PreprocessedStringOutputSteam(ConnectionState connectionState, Action action) {
        this.stringBuilder = new StringBuilder();
        this.connectionState = connectionState;
        this.action = action;
    }

    @Override
    public void write(int b) throws IOException {
        stringBuilder.append((char) b);
    }

    @Override
    public void close(){
        String response = stringBuilder.toString();
        action.resolve(response+"\r\n\r\n");
    }
}

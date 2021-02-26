package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpPrincipal;
import org.riversun.promise.Action;
import org.riversun.promise.Promise;
import rawhttp.core.*;
import rawhttp.core.body.BodyReader;
import rawhttp.core.body.FramedBody;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;

public class RawHttpExchange {
    private RawHttpRequest rawHttpRequest;
    private Headers responseHeaders;
    private OutputStream outputStream;
    private InetSocketAddress inetSocketAddress;
    private ConnectionState connectionState;

    public RawHttpExchange(RawHttpRequest rawHttpRequest, InetSocketAddress inetSocketAddress, ConnectionState connectionState, Action action) {
        this.rawHttpRequest = rawHttpRequest;
        this.inetSocketAddress = inetSocketAddress;
        this.responseHeaders = new Headers();
        this.outputStream = new PreprocessedStringOutputSteam(connectionState, action);
        this.connectionState = connectionState;
    }

    public ConnectionState getConnectionState() {
        return connectionState;
    }

    public RawHttpHeaders getRequestHeaders() {
        return rawHttpRequest.getHeaders();
    }


    public Headers getResponseHeaders() {
        return responseHeaders;
    }


    public URI getRequestURI() {
        return rawHttpRequest.getUri();
    }


    public String getRequestMethod() {
        return rawHttpRequest.getMethod();
    }


    public HttpContext getHttpContext() {
        return null;
    }


    public void close() {
        try {
            outputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public InputStream getRequestBody() {
        if (rawHttpRequest.getBody().isPresent()) return rawHttpRequest.getBody().get().asRawStream();
        return null;
    }


    public OutputStream getResponseBody() {
        return outputStream;
    }


    public void sendResponseHeaders(int rCode, long responseLength) throws IOException {
        RawHttpHeaders.Builder builder = RawHttpHeaders.newBuilder();
        responseHeaders.forEach((s, strings) -> builder.with(s, strings.get(0)));
        RawHttpResponse response = new RawHttpResponse(null,
                rawHttpRequest,
                new StatusLine(HttpVersion.HTTP_1_1, rCode, ""),
                builder.build(),
                null
        );
        response.writeTo(outputStream);
    }


    public InetSocketAddress getRemoteAddress() {
        return this.inetSocketAddress;
    }


    public int getResponseCode() {
        return 0;
    }


    public InetSocketAddress getLocalAddress() {
        return new InetSocketAddress(0);
    }


    public String getProtocol() {
        return "HTTP";
    }


    public Object getAttribute(String name) {
        return null;
    }


    public void setAttribute(String name, Object value) {

    }


    public void setStreams(InputStream i, OutputStream o) {

    }


    public HttpPrincipal getPrincipal() {
        return null;
    }

}

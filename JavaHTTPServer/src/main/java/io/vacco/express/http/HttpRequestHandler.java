package io.vacco.express.http;

import io.vacco.express.http.request.Request;
import io.vacco.express.http.response.Response;

/**
 * @author Simon Reinisch
 * Interface to handle an http-request
 */
@FunctionalInterface
public interface HttpRequestHandler {

    /**
     * Handle an http-request
     *
     * @param req - The request object
     * @param res - The response object
     */
    void handle(Request req, Response res);
}

package io.vacco.express;

import io.vacco.express.filter.FilterImpl;
import io.vacco.express.filter.FilterLayerHandler;
import io.vacco.express.filter.FilterTask;
import io.vacco.express.filter.FilterWorker;
import io.vacco.express.http.HttpRequestHandler;

import java.util.ArrayList;

/**
 * @author Simon Reinisch
 * Basic implementation of an router
 */
public class ExpressRouter implements Router {

    private final ArrayList<FilterWorker> workers;
    private final FilterLayerHandler handler;
    private final Express express;

    public ExpressRouter(Express express){
        // Initialize
        this.express = express;
        workers = new ArrayList<>();
        handler = new FilterLayerHandler(2);
    }

    public ExpressRouter use(HttpRequestHandler middleware) {
        addMiddleware("*", "*", middleware);
        return this;
    }

    public ExpressRouter use(String context, HttpRequestHandler middleware) {
        addMiddleware("*", context, middleware);
        return this;
    }

    public ExpressRouter use(String context, String requestMethod, HttpRequestHandler middleware) {
        addMiddleware(requestMethod.toUpperCase(), context, middleware);
        return this;
    }

    private void addMiddleware(String requestMethod, String context, HttpRequestHandler middleware) {

        // Validate middleware
        if (middleware instanceof FilterTask) {
            workers.add(new FilterWorker((FilterTask) middleware));
        }

        handler.add(0, new FilterImpl(requestMethod, context, middleware, express));
    }

    public ExpressRouter all(HttpRequestHandler request) {
        handler.add(1, new FilterImpl("*", "*", request, express));
        return this;
    }

    public ExpressRouter all(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("*", context, request, express));
        return this;
    }

    public ExpressRouter all(String context, String requestMethod, HttpRequestHandler request) {
        handler.add(1, new FilterImpl(requestMethod, context, request, express));
        return this;
    }

    public ExpressRouter get(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("GET", context, request, express));
        return this;
    }

    public ExpressRouter post(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("POST", context, request, express));
        return this;
    }

    public ExpressRouter put(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("PUT", context, request, express));
        return this;
    }

    public ExpressRouter delete(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("DELETE", context, request, express));
        return this;
    }

    public ExpressRouter patch(String context, HttpRequestHandler request) {
        handler.add(1, new FilterImpl("PATCH", context, request, express));
        return this;
    }

    ArrayList<FilterWorker> getWorker() {
        return workers;
    }

    FilterLayerHandler getHandler() {
        return handler;
    }
}

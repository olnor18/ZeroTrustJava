package dk.sdu.mmmi.olnor18.zerotrust.httpserver;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.tcp.TCPServer;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.connections.ws.WSServer;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.utilities.Encryptor;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.persistance.ConstantStringPersistanceHandler;
import io.vacco.express.Express;
import io.vacco.express.middleware.Middleware;
import io.vacco.express.utils.Status;

import java.net.URISyntaxException;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        Express app = new Express();

        app.use(Middleware.cors());

        app.get("/", (req, res) -> {
            try {
                res.send(Paths.get(ClassLoader.getSystemResource("public/index.html").toURI()));
            } catch (URISyntaxException e) {
                res.sendStatus(Status._500);
                e.printStackTrace();
            }
        });

        app.get("/about", (req, res) -> {
            try {
                res.send(Paths.get(ClassLoader.getSystemResource("public/about.html").toURI()));
            } catch (URISyntaxException e) {
                res.sendStatus(Status._500);
                e.printStackTrace();
            }
        });

        app.get("/login", (req, res) -> {
            try {
                res.send(Paths.get(ClassLoader.getSystemResource("public/login.html").toURI()));
            } catch (URISyntaxException e) {
                res.sendStatus(Status._500);
                e.printStackTrace();
            }
        });

        app.get("/getChallenge/:user", (req, res) -> {
            String key = Encryptor.generateKey();
            if (key == null)  {
                res.sendStatus(Status._500);
                return;
            }
            String username = req.getParam("user");
            String publicKey = ConstantStringPersistanceHandler.getInstance().getPublicKey(username);
            String challenge = Encryptor.encryptChallange(key, publicKey);

            if (challenge == null)  {
                res.sendStatus(Status._500);
                return;
            }
            req.exchange.getConnectionState().setKey(key);
            res.send(challenge);
        });
        new TCPServer();
        app.listen(8080, new WSServer());
    }
}

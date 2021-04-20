package dk.sdu.mmmi.olnor18.zerotrust.httpserver;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.Encryptor;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.PersistanceHandler;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.state.ConnectionState;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.ServerType;
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

        app.get("/getLoginHTML", (req, res) -> {
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
            String publicKey = PersistanceHandler.getInstance().getPublicKey(username);
            String challenge = Encryptor.encryptChallange(key, publicKey);

            if (challenge == null)  {
                res.sendStatus(Status._500);
                return;
            }
            req.exchange.getConnectionState().setKey(key);
            res.send(challenge);
        });

        app.listen(8080, ServerType.WebSocket);
    }
}

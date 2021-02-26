package dk.sdu.mmmi.olnor18.zerotrust.httpserver;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.Encryptor;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.PersistanceHandler;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.ServerType;
import io.vacco.express.Express;
import io.vacco.express.middleware.Middleware;
import io.vacco.express.utils.Status;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        Express app = new Express();

        app.use(Middleware.cors());

        app.get("/", (req, res) -> {
            res.send("Hello World");
        });

        app.get("/getChallenge", (req, res) -> {
            String key = Encryptor.generateKey();

            if (key == null)  {
                res.sendStatus(Status._500);
                return;
            }

            String challenge = null;

            try {
                byte[] bytes = req.getBody().readAllBytes();
                String body = new String(bytes);
                JSONParser parser = new JSONParser();
                JSONObject jsonBody = (JSONObject) parser.parse(body);
                String username = (String) jsonBody.get("username");
                String publicKey = PersistanceHandler.getInstance().getPublicKey(username);
                challenge = Encryptor.encryptChallange(key, publicKey);
            } catch (IOException | ParseException e) {
                e.printStackTrace();
                res.sendStatus(Status._500);
            }

            if (challenge == null)  {
                res.sendStatus(Status._500);
                return;
            }

            res.setHeader("HTTPZT-CHALLENGE", challenge);
            res.sendStatus(Status._200);
            req.exchange.getConnectionState().setKey(key);
        });

        app.listen(8080, ServerType.TCP);
    }
}

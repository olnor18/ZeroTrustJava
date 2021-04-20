package dk.sdu.mmmi.olnor18.zerotrust.httpserver;

import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.Encryptor;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.PersistanceHandler;
import dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.utilities.ConnectionState;
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

        app.get("/getLoginHTML", (req, res) -> {
            res.send("<div class=\"login-page\">\n" +
                    "    <div class=\"form\">\n" +
                    "      <form class=\"login-form\">\n" +
                    "        <input type=\"text\" placeholder=\"username\" id=\"username\"/>\n" +
                    "        <input type=\"password\" placeholder=\"password\" id=\"password\"/>\n" +
                    "        <button type=\"submit\">login</button>\n" +
                    "        <!--<p class=\"message\">Not registered? <a href=\"#\">Create an account</a></p>-->\n" +
                    "      </form>\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "<style>\n" +
                    "    @import url(https://fonts.googleapis.com/css?family=Roboto:300);\n" +
                    "    * {\n" +
                    "        --background: #6495ed;\n" +
                    "    }\n" +
                    "\n" +
                    "    .login-page {\n" +
                    "      width: 360px;\n" +
                    "      padding: 8% 0 0;\n" +
                    "      margin: auto;\n" +
                    "    }\n" +
                    "    .form {\n" +
                    "      position: relative;\n" +
                    "      z-index: 1;\n" +
                    "      background: #FFFFFF;\n" +
                    "      max-width: 360px;\n" +
                    "      margin: 0 auto 100px;\n" +
                    "      padding: 45px;\n" +
                    "      text-align: center;\n" +
                    "      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);\n" +
                    "    }\n" +
                    "    .form input {\n" +
                    "      font-family: \"Roboto\", sans-serif;\n" +
                    "      outline: 0;\n" +
                    "      background: #f2f2f2;\n" +
                    "      width: 100%;\n" +
                    "      border: 0;\n" +
                    "      margin: 0 0 15px;\n" +
                    "      padding: 15px;\n" +
                    "      box-sizing: border-box;\n" +
                    "      font-size: 14px;\n" +
                    "    }\n" +
                    "    .form button {\n" +
                    "      font-family: \"Roboto\", sans-serif;\n" +
                    "      text-transform: uppercase;\n" +
                    "      outline: 0;\n" +
                    "      background: var(--background);\n" +
                    "      filter: brightness(90%);\n" +
                    "      width: 100%;\n" +
                    "      border: 0;\n" +
                    "      padding: 15px;\n" +
                    "      color: #FFFFFF;\n" +
                    "      font-size: 14px;\n" +
                    "      -webkit-transition: all 0.3 ease;\n" +
                    "      transition: all 0.3 ease;\n" +
                    "      cursor: pointer;\n" +
                    "    }\n" +
                    "    .form button:hover,.form button:active,.form button:focus{\n" +
                    "        filter: brightness(80%);\n" +
                    "    }\n" +
                    "    .container {\n" +
                    "      position: relative;\n" +
                    "      z-index: 1;\n" +
                    "      max-width: 300px;\n" +
                    "      margin: 0 auto;\n" +
                    "    }\n" +
                    "    .container:before, .container:after {\n" +
                    "      content: \"\";\n" +
                    "      display: block;\n" +
                    "      clear: both;\n" +
                    "    }\n" +
                    "    .container .info {\n" +
                    "      margin: 50px auto;\n" +
                    "      text-align: center;\n" +
                    "    }\n" +
                    "    .container .info h1 {\n" +
                    "      margin: 0 0 15px;\n" +
                    "      padding: 0;\n" +
                    "      font-size: 36px;\n" +
                    "      font-weight: 300;\n" +
                    "      color: #1a1a1a;\n" +
                    "    }\n" +
                    "    .container .info span {\n" +
                    "      color: white;\n" +
                    "      font-size: 12px;\n" +
                    "    }\n" +
                    "    .container .info span a {\n" +
                    "      color: #000000;\n" +
                    "      text-decoration: none;\n" +
                    "    }\n" +
                    "    body {\n" +
                    "      background: var(--background); \n" +
                    "      font-family: \"Roboto\", sans-serif;\n" +
                    "      -webkit-font-smoothing: antialiased;\n" +
                    "      -moz-osx-font-smoothing: grayscale;      \n" +
                    "    }\n" +
                    "</style>");
        });

        app.get("/getChallenge/:user", (req, res) -> {
            String key = Encryptor.generateKey();
            System.out.println(key);
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
            System.out.println(challenge);
            ConnectionState state = req.exchange.getConnectionState().setKey(key);
            req.exchange.setConnectionState(state);
            res.send(challenge);
        });

        app.listen(8080, ServerType.WebSocket);
    }
}

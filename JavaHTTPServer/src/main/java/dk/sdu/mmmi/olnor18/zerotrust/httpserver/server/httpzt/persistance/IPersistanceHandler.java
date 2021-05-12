package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.persistance;

public interface IPersistanceHandler {
    String getPublicKey(String username);

    boolean savePublicKey(String username, String publicKey);
}

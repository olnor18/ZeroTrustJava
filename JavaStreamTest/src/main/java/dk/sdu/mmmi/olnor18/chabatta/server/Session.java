package dk.sdu.mmmi.olnor18.chabatta.server;

public class Session {
    private byte[] secret = new byte[256];

    public Session(){

    }

    public byte[] getSecret() {
        return secret;
    }

    public void setSecret(byte[] secret) {
        this.secret = secret;
    }
}

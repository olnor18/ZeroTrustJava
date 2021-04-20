package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt;

public class PersistanceHandler {
    private static PersistanceHandler instance;

    public static PersistanceHandler getInstance() {
        if (instance == null) {
            instance = new PersistanceHandler();
        }
        return instance;
    }

    public PersistanceHandler(){
        //Do actual db initialization
    }

    public synchronized String getPublicKey(String username){
        //Do actual db lookup
        return "-----BEGIN PUBLIC KEY-----\n" +
                "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhz8JPlZkGs2FsMQoHEQo\n" +
                "kWwRYxLifJP/IC1CF6R434Ogr/sV/EOQ5qHOEvheH3pppM0n1JHyk1zxL8z2BhV4\n" +
                "+wP0hwm36M/4bz3g+lMzHGE+N6TuN0DIvaP3w4PORZGasiYQnTXvieDfCQKYqqY8\n" +
                "mW7YRsrqCUwtqyPeD0mCgfTXwmRsvWMBmy4EZBhLTBUb5FSHWEJELO84fzwakMnU\n" +
                "DwwPSHShxDQQs71Ocltxzxnvl2D2a8lCYPKfBXFLxaoCpVc6OMr4aeit16eu7+re\n" +
                "BsO6z7226VaahIY3h3zhkgIAnAx5/RqIfp+eKtdfG23pwYWA/wXqzGZ/z5BU+6WW\n" +
                "TQIDBlU3\n" +
                "-----END PUBLIC KEY-----";
    }
}

package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt.persistance;

public class ConstantStringPersistanceHandler implements IPersistanceHandler {
    private static ConstantStringPersistanceHandler instance;

    private ConstantStringPersistanceHandler(){
        //Do actual db initialization
    }

    public static ConstantStringPersistanceHandler getInstance() {
        if (ConstantStringPersistanceHandler.instance == null) {
            ConstantStringPersistanceHandler.instance = new ConstantStringPersistanceHandler();
        }
        return ConstantStringPersistanceHandler.instance;
    }

    @Override
    public synchronized String getPublicKey(String username){
        //test:password
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

    @Override
    public synchronized boolean savePublicKey(String username, String publicKey){
        //Inplement actual saving
        return true;
    }
}

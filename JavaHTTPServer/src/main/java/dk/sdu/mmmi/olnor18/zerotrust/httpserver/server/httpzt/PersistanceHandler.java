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
        return "-----BEGIN PUBLIC KEY-----\r\nMIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBizdksSU4mkQKNOLuo2gPr\r\nBl0czsaEWCNfPRYRUep86AXb/3ciBc7K4rfAfaHxGEy0ElNaB7jEpZqwqKFQnKI2\r\nei40x7+t4kj5OkV7mEmd9hd/nL1eReIp7D8rnsoH3oAEZ2PFejc8zcyZqSHXLCZG\r\nYn7MDZOmgCPbyJSIADghM5VBMbIwP7/+z8ANIi3ash3UvPc3RStaibGO2UCFlRWW\r\nBWyW84e4XG0Nh9PnfUAfF7ecQ5rBg5tdtZLerJrLZO4UOGPmRkVRjdk7ojil/qWo\r\nTTFzKBe6Bn5qClfkccrpVIqOwejS8+UkXu0zTjlumnPxrQaHXjs77tZKY8wGV0uV\r\nAgMGVTc=\r\n-----END PUBLIC KEY-----\r\n";
    }
}

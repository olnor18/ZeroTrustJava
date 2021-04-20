package dk.sdu.mmmi.olnor18.chabatta.packet;

import static dk.sdu.mmmi.olnor18.chabatta.utils.HexConversion.encodeHexString;

public class BadHMACException extends Exception {
     public BadHMACException(){
         super("Bad HMAC signature");
     }

    public BadHMACException(byte[] packetChecksum, byte[] calculatedChecksum){
        super("Bad HMAC signature: packetchecksum: " + encodeHexString(packetChecksum) + ", calculatedchecksum: "+encodeHexString(calculatedChecksum));
    }
}

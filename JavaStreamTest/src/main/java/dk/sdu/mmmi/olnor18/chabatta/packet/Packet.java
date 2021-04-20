package dk.sdu.mmmi.olnor18.chabatta.packet;

import com.google.common.io.ByteArrayDataInput;
import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;
import com.google.common.primitives.Bytes;
import com.google.common.primitives.UnsignedInteger;
import dk.sdu.mmmi.olnor18.chabatta.utils.AESCipher;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Packet {
    private byte version;
    private int lenght;
    private byte[] checksum = new byte[32];
    private byte[] data;
    private byte[] secret;

    public Packet(byte[] secret){
        this.version = 1;
        this.secret = secret;
    }

    public Packet (Socket socket, byte[] secret) throws IOException, BadHMACException {
        DataInputStream in = new DataInputStream(socket.getInputStream());
        this.version = in.readByte();
        this.lenght = in.readInt();
        in.readFully(checksum);
        this.data = new byte[this.lenght];
        in.readFully(this.data);
        byte[] calculatedChecksum = getChecksum();
        if (!Arrays.equals(this.checksum, calculatedChecksum)){
            this.data = null;
            throw new BadHMACException(this.checksum, calculatedChecksum);
        } else {
            this.data = AESCipher.decryptDate(this.data, this.secret);
        }
    }

    public Packet (byte[] rawPacket, byte[] secret) throws BadHMACException{
        this.secret = secret;
        ByteArrayDataInput in = ByteStreams.newDataInput(rawPacket);
        this.version = in.readByte();
        this.lenght = in.readInt();
        this.data = new byte[this.lenght];
        in.readFully(this.checksum);
        in.readFully(this.data);
        byte[] calculatedChecksum = getChecksum();
        if (!Arrays.equals(this.checksum, calculatedChecksum)){
            this.data = null;
            throw new BadHMACException(this.checksum, calculatedChecksum);
        } else {
            this.data = AESCipher.decryptDate(this.data, this.secret);
        }
    }

    public void setData(byte[] data) {
        this.data = AESCipher.encryptData(data, secret);
        this.lenght = this.data.length;
        this.checksum = getChecksum();
    }

    public byte[] toBytes(){
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.write(this.version);
        out.writeInt(this.lenght);
        out.write(this.checksum);
        return out.toByteArray();
    }

    public byte getVersion() {
        return version;
    }

    public int getLenght() {
        return lenght;
    }

    public byte[] getData() {
        return data;
    }

    private byte[] getChecksum() {
        Mac hmac;
        try {
            hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(secret, "HmacSHA256");
            hmac.init(keySpec);
            return hmac.doFinal(this.data);
        } catch (InvalidKeyException | NoSuchAlgorithmException e) {
            e.printStackTrace();
            return new byte[32];
        }
    }
}


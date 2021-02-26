package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Encryptor {
    private static final String SYMMETRIC_ENCRYPTION_ALGORITHM = "AES";
    private static final int SYMMETIC_ENCRYPTION_KEYSIZE = 256;
    private static final String ASYMMETRIC_ENCRYPTION_ALGORITHM = "RSA";
    private static final String ASYMMETRIC_PADDING_SCHEME = "RSA/ECB/PKCS1Padding";

    public static String generateKey(){
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            keyGen.init(SYMMETIC_ENCRYPTION_KEYSIZE);
            SecretKey secretKey = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String decryptMessage(String messageb64, String keyb64){
        try {
            Cipher cipher = Cipher.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            byte[] key = Base64.getDecoder().decode(keyb64);
            cipher.init(Cipher.DECRYPT_MODE,  new SecretKeySpec(key, SYMMETRIC_ENCRYPTION_ALGORITHM));
            byte[] plainText = cipher.doFinal(Base64.getDecoder().decode(messageb64));
            return new String(plainText);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String encryptMessage(String message, String keyb64){
        try {
            Cipher cipher = Cipher.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            byte[] key = Base64.getDecoder().decode(keyb64);
            cipher.init(Cipher.ENCRYPT_MODE,  new SecretKeySpec(key, SYMMETRIC_ENCRYPTION_ALGORITHM));
            byte[] cipherText = cipher.doFinal(message.getBytes());
            return Base64.getEncoder().encodeToString(cipherText);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String encryptChallange(String challange, String publickey){
        try{
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Base64.getDecoder().decode(publickey));
            KeyFactory keyFactory = KeyFactory.getInstance(ASYMMETRIC_ENCRYPTION_ALGORITHM);
            PublicKey publicKey = keyFactory.generatePublic(keySpec);
            Cipher cipher = Cipher.getInstance(ASYMMETRIC_PADDING_SCHEME);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] cipherText = cipher.doFinal(challange.getBytes());
            return Base64.getEncoder().encodeToString(cipherText);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | InvalidKeyException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }
}

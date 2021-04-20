package dk.sdu.mmmi.olnor18.zerotrust.httpserver.server.httpzt;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Encryptor {
    private static final String SYMMETRIC_ENCRYPTION_ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final int SYMMETIC_ENCRYPTION_KEYSIZE = 256;
    private static final String ASYMMETRIC_ENCRYPTION_ALGORITHM = "RSA";
    private static final String ASYMMETRIC_PADDING_SCHEME = "RSA/ECB/PKCS1Padding";

    public static String generateKey(){
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
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
            cipher.init(Cipher.DECRYPT_MODE,  new SecretKeySpec(key, "AES"), new IvParameterSpec(new byte[]{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}));
            byte[] plainText = cipher.doFinal(Base64.getDecoder().decode(messageb64));
            return new String(plainText);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException | InvalidAlgorithmParameterException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String encryptMessage(String message, String keyb64){
        try {
            Cipher cipher = Cipher.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            byte[] key = Base64.getDecoder().decode(keyb64);
            cipher.init(Cipher.ENCRYPT_MODE,  new SecretKeySpec(key, "AES"), new IvParameterSpec(new byte[]{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}));
            byte[] cipherText = cipher.doFinal(message.getBytes());
            return Base64.getEncoder().encodeToString(cipherText);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException | InvalidAlgorithmParameterException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String encryptChallange(String challange, String publickey){
        try{
            String base64Cert = publickey.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----","").replace("\r\n", "").replace("\n", "");
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Base64.getDecoder().decode(base64Cert));
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

package dk.sdu.mmmi.olnor18.chabatta.utils;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class AESCipher {
    private static final String SYMMETRIC_ENCRYPTION_ALGORITHM = "AES";
    private static final int SYMMETIC_ENCRYPTION_KEYSIZE = 256;
    private static final String ASYMMETRIC_ENCRYPTION_ALGORITHM = "RSA";
    private static final String ASYMMETRIC_PADDING_SCHEME = "RSA/ECB/PKCS1Padding";

    public static byte[] encryptData(byte[] data, byte[] key){
        try {
            Cipher cipher = Cipher.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE,  new SecretKeySpec(key, SYMMETRIC_ENCRYPTION_ALGORITHM));
            return cipher.doFinal(data);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static byte[] decryptDate(byte[] encryptedData, byte[] key){
        try {
            Cipher cipher = Cipher.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE,  new SecretKeySpec(key, SYMMETRIC_ENCRYPTION_ALGORITHM));
            return cipher.doFinal(encryptedData);
        } catch (NoSuchPaddingException | NoSuchAlgorithmException | InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static byte[] generateKey(){
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance(SYMMETRIC_ENCRYPTION_ALGORITHM);
            keyGen.init(SYMMETIC_ENCRYPTION_KEYSIZE);
            SecretKey secretKey = keyGen.generateKey();
            return secretKey.getEncoded();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static byte[] encryptChallange(byte[] challange, String publickey){
        try{
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Base64.getDecoder().decode(publickey));
            KeyFactory keyFactory = KeyFactory.getInstance(ASYMMETRIC_ENCRYPTION_ALGORITHM);
            PublicKey publicKey = keyFactory.generatePublic(keySpec);
            Cipher cipher = Cipher.getInstance(ASYMMETRIC_PADDING_SCHEME);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            return cipher.doFinal(challange);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | InvalidKeyException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }
}

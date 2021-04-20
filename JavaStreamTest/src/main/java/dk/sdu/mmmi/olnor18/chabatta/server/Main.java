package dk.sdu.mmmi.olnor18.chabatta.server;

import dk.sdu.mmmi.olnor18.chabatta.server.tcp.ServerThread;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Main {
    public static boolean running = true;


    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(6868)){
            while (running) {
                Socket socket = serverSocket.accept();
                new ServerThread(socket).start();
            }
        } catch (IOException e){

        }
    }
}

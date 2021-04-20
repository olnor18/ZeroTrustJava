package dk.sdu.mmmi.olnor18.chabatta.server.tcp;

import dk.sdu.mmmi.olnor18.chabatta.packet.BadHMACException;
import dk.sdu.mmmi.olnor18.chabatta.packet.Packet;
import dk.sdu.mmmi.olnor18.chabatta.server.Session;

import java.io.*;
import java.net.Socket;

public class ServerThread extends Thread{
    private Socket socket;
    private Session session;

    public ServerThread(Socket socket) {
        this.socket = socket;
        this.session = new Session();
    }

    public void run() {
        try {
            while (!socket.isClosed()) {
                Packet packet = new Packet(this.socket, this.session.getSecret());

            }
            socket.close();
        } catch (IOException | BadHMACException ex) {
            System.out.println("ServerThread exception: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}

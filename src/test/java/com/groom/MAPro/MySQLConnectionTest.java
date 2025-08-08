package com.groom.MAPro;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySQLConnectionTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://keyword-02.cbyqikm2gos5.ap-northeast-2.rds.amazonaws.com:3306/mapro?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul";
        String username = "dev";
        String password = "Dev1010**";
        
        try {
            System.out.println("Starting MySQL connection test...");
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("SUCCESS: MySQL connection established!");
            
            // Database info
            System.out.println("Database: " + connection.getCatalog());
            System.out.println("URL: " + connection.getMetaData().getURL());
            System.out.println("User: " + connection.getMetaData().getUserName());
            
            connection.close();
            System.out.println("Connection closed successfully.");
        } catch (SQLException e) {
            System.out.println("FAILED: MySQL connection failed");
            System.out.println("Error Code: " + e.getErrorCode());
            System.out.println("SQL State: " + e.getSQLState());
            System.out.println("Message: " + e.getMessage());
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            System.out.println("FAILED: MySQL driver not found");
            e.printStackTrace();
        }
    }
}
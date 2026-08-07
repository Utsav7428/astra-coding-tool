package com.utsav.astra_backend.workspace.index;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;

public class HashUtil {

    public static String sha256(Path path) {

        try {

            byte[] bytes = Files.readAllBytes(path);

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(bytes);

            StringBuilder builder = new StringBuilder();

            for (byte b : hash) {

                builder.append(String.format("%02x", b));

            }

            return builder.toString();

        } catch (Exception e) {

            throw new RuntimeException(e);

        }

    }

}
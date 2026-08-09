package com.utsav.astra_backend.workspace.index;

import java.nio.file.Path;

public class LanguageDetector {

    public static String detect(Path path) {

        String file = path.getFileName().toString();

        int dot = file.lastIndexOf(".");

        if (dot == -1) {
            return "text";
        }

        String ext = file.substring(dot + 1);

        return switch (ext) {

            case "java" -> "java";
            case "kt" -> "kotlin";
            case "go" -> "go";
            case "cpp", "cc", "cxx" -> "cpp";
            case "c" -> "c";
            case "py" -> "python";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "tsx" -> "tsx";
            case "jsx" -> "jsx";
            case "json" -> "json";
            case "xml" -> "xml";
            case "yml", "yaml" -> "yaml";
            case "md" -> "markdown";
            default -> "text";

        };

    }

}
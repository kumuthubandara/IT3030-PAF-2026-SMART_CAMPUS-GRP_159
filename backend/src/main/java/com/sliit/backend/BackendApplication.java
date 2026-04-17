package com.sliit.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
@EnableMongoRepositories(basePackages = {
        "com.sliit.backend.resource",
        "com.sliit.backend.contact",
        "com.sliit.backend.activity",
        "com.sliit.backend.ticket"
})
public class BackendApplication {

    public static void main(String[] args) {
        loadDotEnvAsProperties();
        maybeComposeMongoUriFromParts();
        applyMongoUriFromEnv();
        warnIfUsingLocalMongoFallback();
        SpringApplication.run(BackendApplication.class, args);
    }

    /**
     * Env file resolution order:
     * <ol>
     *   <li>{@code SMART_CAMPUS_ENV_FILE} — absolute path to any {@code .env} you want (IDE-friendly)</li>
     *   <li>First {@code backend/.env} or {@code .env} (walking up from {@code user.dir}) that defines {@code MONGODB_URI}</li>
     *   <li>First existing env file from that search</li>
     * </ol>
     * Values are applied as {@link System#setProperty} (OS env vars still win for duplicate keys).
     */
    private static List<Path> candidateEnvFiles() {
        Set<Path> ordered = new LinkedHashSet<>();
        String explicit = firstNonBlank(System.getenv("SMART_CAMPUS_ENV_FILE"), System.getProperty("SMART_CAMPUS_ENV_FILE"));
        if (explicit != null) {
            ordered.add(Paths.get(explicit).toAbsolutePath().normalize());
        }
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path p = cwd;
        for (int i = 0; i < 10 && p != null; i++) {
            ordered.add(p.resolve("backend").resolve(".env"));
            ordered.add(p.resolve(".env"));
            p = p.getParent();
        }
        return new ArrayList<>(ordered);
    }

    private static void loadDotEnvAsProperties() {
        try {
            Path envFile = null;
            for (Path candidate : candidateEnvFiles()) {
                if (!Files.isRegularFile(candidate) || !Files.isReadable(candidate)) {
                    continue;
                }
                String text = Files.readString(candidate);
                boolean definesMongo = text.lines()
                        .map(String::strip)
                        .filter(l -> !l.isEmpty() && !l.startsWith("#"))
                        .anyMatch(l -> l.startsWith("MONGODB_URI=") || l.startsWith("SPRING_DATA_MONGODB_URI="));
                if (definesMongo) {
                    envFile = candidate;
                    break;
                }
            }
            if (envFile == null) {
                for (Path candidate : candidateEnvFiles()) {
                    if (Files.isRegularFile(candidate) && Files.isReadable(candidate)) {
                        envFile = candidate;
                        break;
                    }
                }
            }
            if (envFile == null) {
                return;
            }
            Dotenv dotenv = Dotenv.configure()
                    .directory(envFile.getParent().toString())
                    .filename(".env")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(e -> {
                if (System.getenv(e.getKey()) == null) {
                    System.setProperty(e.getKey(), e.getValue());
                }
            });
            System.err.println("[smart-campus-backend] Loaded environment from: " + envFile.toAbsolutePath());
        } catch (Exception ignored) {
            // optional file; use OS env / JVM -D flags / IDE run configuration.
        }
    }

    /**
     * If {@code MONGODB_URI} is missing but {@code MONGODB_USERNAME}, {@code MONGODB_PASSWORD}, and
     * {@code MONGODB_ATLAS_HOST} are set (e.g. in {@code .env}), build an Atlas SRV URI.
     */
    private static void maybeComposeMongoUriFromParts() {
        if (firstNonBlank(System.getProperty("MONGODB_URI"), System.getenv("MONGODB_URI")) != null) {
            return;
        }
        String user = firstNonBlank(System.getProperty("MONGODB_USERNAME"), System.getenv("MONGODB_USERNAME"));
        String pass = firstNonBlank(System.getProperty("MONGODB_PASSWORD"), System.getenv("MONGODB_PASSWORD"));
        String host = firstNonBlank(System.getProperty("MONGODB_ATLAS_HOST"), System.getenv("MONGODB_ATLAS_HOST"));
        String db = firstNonBlank(System.getProperty("MONGODB_DATABASE"), System.getenv("MONGODB_DATABASE"));
        if (db == null || db.isBlank()) {
            db = "smart_campus";
        }
        if (user == null || pass == null || host == null || host.isBlank()) {
            return;
        }
        String encUser = URLEncoder.encode(user, StandardCharsets.UTF_8);
        String encPass = URLEncoder.encode(pass, StandardCharsets.UTF_8);
        String uri = "mongodb+srv://" + encUser + ":" + encPass + "@" + host.strip() + "/" + db.strip()
                + "?retryWrites=true&w=majority";
        System.setProperty("MONGODB_URI", uri);
    }

    /**
     * Copies {@code MONGODB_URI} (or {@code SPRING_DATA_MONGODB_URI}) onto {@code spring.data.mongodb.uri}
     * so Spring Boot always picks up Atlas when those are set.
     */
    private static void applyMongoUriFromEnv() {
        String fromProp = firstNonBlank(
                System.getProperty("MONGODB_URI"),
                System.getenv("MONGODB_URI"),
                System.getenv("SPRING_DATA_MONGODB_URI")
        );
        if (fromProp != null) {
            System.setProperty("spring.data.mongodb.uri", fromProp.trim());
            System.setProperty("MONGODB_URI", fromProp.trim());
        }
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    private static void warnIfUsingLocalMongoFallback() {
        String uri = System.getProperty("spring.data.mongodb.uri");
        if (uri == null) {
            return;
        }
        String u = uri.toLowerCase();
        if (u.contains("127.0.0.1") || u.contains("localhost")) {
            System.err.println("""
                    [smart-campus-backend] MongoDB is using localhost (127.0.0.1:27017).
                    For Atlas: create backend/.env next to mvnw.cmd with:
                      MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.../smart_campus?retryWrites=true&w=majority
                    Or set SMART_CAMPUS_ENV_FILE to the full path of your .env file.
                    Or set MONGODB_URI / SPRING_DATA_MONGODB_URI in your OS environment / IDE run config.
                    """);
        }
    }
}

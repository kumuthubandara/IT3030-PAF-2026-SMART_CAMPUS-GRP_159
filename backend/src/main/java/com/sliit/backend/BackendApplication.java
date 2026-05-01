package com.sliit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"com.sliit.backend.activity"})
@EnableMongoRepositories(basePackages = {
		"com.sliit.backend.resource",
		"com.sliit.backend.contact",
		"com.sliit.backend.notification",
		"com.sliit.backend.user",
		"com.sliit.backend.booking",
		"com.sliit.backend.ticket"
})
public class BackendApplication {

	public static void main(String[] args) {
		/*
		 * springboot3-dotenv loads ".env" from the JVM working directory by default.
		 * If you start the app from the repo root (common in IDEs), only ./.env is seen — not backend/.env.
		 * Point dotenv at backend/ when ./.env is missing but ./backend/.env exists.
		 * See: https://github.com/paulschwarz/spring-dotenv#configuration-optional (springdotenv.directory)
		 */
		Path cwd = Path.of("").toAbsolutePath().normalize();
		Path envInCwd = cwd.resolve(".env");
		Path envInBackendSubdir = cwd.resolve("backend").resolve(".env");
		if (!Files.exists(envInCwd) && Files.exists(envInBackendSubdir)) {
			System.setProperty("springdotenv.directory", cwd.resolve("backend").toString());
		}
		SpringApplication.run(BackendApplication.class, args);
	}

}

package com.sliit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"com.sliit.backend.activity"})
@EnableMongoRepositories(basePackages = {
		"com.sliit.backend.resource",
		"com.sliit.backend.contact",
		"com.sliit.backend.notification",
		"com.sliit.backend.user"
})
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}

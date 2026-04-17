package com.sliit.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Loads full context; requires MongoDB at spring.data.mongodb.uri (see src/test/resources/application.properties).")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}

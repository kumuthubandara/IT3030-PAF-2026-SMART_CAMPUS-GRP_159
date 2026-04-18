package com.sliit.backend.config;

import com.mongodb.MongoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.UncategorizedMongoDbException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Turns Mongo connectivity / driver failures into JSON with 503 so the frontend can show a clear message
 * instead of a generic 500 Internal Server Error. (Does not catch generic JPA {@code DataAccessException}.)
 */
@RestControllerAdvice
public class MongoDataExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(MongoDataExceptionHandler.class);

    @ExceptionHandler({ MongoException.class, UncategorizedMongoDbException.class })
    public ResponseEntity<Map<String, String>> handleMongo(RuntimeException ex) {
        log.error("MongoDB operation failed", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "message",
                        "Database connection failed. Check MONGODB_URI in backend/.env, restart the server, "
                                + "and if you use MongoDB Atlas add your current IP under Network Access."));
    }
}

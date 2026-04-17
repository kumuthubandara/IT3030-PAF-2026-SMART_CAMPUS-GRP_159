package com.sliit.backend.mongo;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/**
 * Allocates monotonic numeric ids. Uses {@code findAndModify} with upsert; if the driver returns
 * {@code null} (seen on some upsert edge cases), falls back to {@code findById} or a fresh insert.
 */
@Service
public class MongoSequenceService {

    private static final String COLLECTION = "database_sequences";

    private final MongoTemplate mongoTemplate;

    public MongoSequenceService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public synchronized long next(String sequenceName) {
        DatabaseSequence updated = mongoTemplate.findAndModify(
                Query.query(Criteria.where("_id").is(sequenceName)),
                new Update().inc("seq", 1),
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                DatabaseSequence.class,
                COLLECTION
        );
        if (updated != null) {
            return updated.getSeq();
        }
        DatabaseSequence existing = mongoTemplate.findById(sequenceName, DatabaseSequence.class, COLLECTION);
        if (existing != null) {
            return existing.getSeq();
        }
        DatabaseSequence seed = new DatabaseSequence();
        seed.setId(sequenceName);
        seed.setSeq(1L);
        try {
            mongoTemplate.save(seed, COLLECTION);
        } catch (DuplicateKeyException e) {
            DatabaseSequence again = mongoTemplate.findById(sequenceName, DatabaseSequence.class, COLLECTION);
            if (again != null) {
                return again.getSeq();
            }
        }
        return 1L;
    }
}

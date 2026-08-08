package com.utsav.astra_backend.embedding;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VectorStore {

    private final Map<String, EmbeddingRecord> vectors =
            new ConcurrentHashMap<>();

    public void put(
            EmbeddingRecord record
    ) {

        vectors.put(
                record.id(),
                record
        );
    }

    public void remove(
            String id
    ) {

        vectors.remove(id);
    }

    public void removeByFile(
            String filePath
    ) {

        vectors.entrySet()
                .removeIf(entry ->
                        entry.getValue()
                                .symbol()
                                .filePath()
                                .equals(filePath)
                );
    }

    public List<EmbeddingRecord> getAll() {

        return new ArrayList<>(
                vectors.values()
        );
    }

    public int size() {

        return vectors.size();
    }

    public void clear() {

        vectors.clear();
    }

    public Collection<EmbeddingRecord> values() {

        return vectors.values();
    }
}
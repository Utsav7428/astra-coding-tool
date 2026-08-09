package com.utsav.astra_backend.embedding;

import java.util.List;

public interface EmbeddingProvider {

    List<Float> embed(String text);
}
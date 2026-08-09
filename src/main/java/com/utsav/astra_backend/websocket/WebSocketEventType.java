package com.utsav.astra_backend.websocket;

public enum WebSocketEventType {

    CONNECTED,

    INDEX_UPDATED,
    FILE_CREATED,
    FILE_MODIFIED,
    FILE_DELETED,

    AI_STREAM_START,
    AI_STREAM_TOKEN,
    AI_STREAM_COMPLETE,
    AI_STREAM_ERROR
}
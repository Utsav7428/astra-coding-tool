package com.utsav.astra_backend.workspace.watcher;

import com.utsav.astra_backend.workspace.index.WorkspaceIndexService;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class WorkspaceWatcherService {

    private final WatchService watchService;
    private final Map<WatchKey, Path> watchKeys = new ConcurrentHashMap<>();
    private final Map<Path, Long> lastModifiedEvents =
            new ConcurrentHashMap<>();

    private static final long MODIFY_DEBOUNCE_MS = 500;
    private ExecutorService watcherExecutor;

    private volatile boolean watching = false;
    private Path currentWorkspace;
    private final WorkspaceIndexService indexService;
    public WorkspaceWatcherService(WorkspaceIndexService indexService) throws IOException {
        this.indexService = indexService;
        this.watchService = FileSystems.getDefault().newWatchService();
    }

    public synchronized void startWatching(Path workspace) {

        if (watching) {

            if (workspace.equals(currentWorkspace)) {
                return;
            }

            stopWatching();
        }

        try {

            registerRecursively(workspace);

            watcherExecutor = Executors.newSingleThreadExecutor();
            watcherExecutor.submit(this::processEvents);

            currentWorkspace = workspace;
            watching = true;

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public synchronized void stopWatching() {

        watching = false;

        currentWorkspace = null;

        watchKeys.clear();
        lastModifiedEvents.clear();
        if (watcherExecutor != null) {
            watcherExecutor.shutdownNow();
        }

        log.info("Workspace watcher stopped.");
    }

    private boolean shouldWatch(Path path) {

        String name = path.getFileName().toString();

        return !name.equals(".git")
                && !name.equals("node_modules")
                && !name.equals("target")
                && !name.equals("build")
                && !name.equals(".idea")
                && !name.equals(".gradle")
                && !name.equals(".vscode");
    }

    private void registerRecursively(Path root) throws IOException {

        Files.walkFileTree(root, new SimpleFileVisitor<>() {

            @Override
            public FileVisitResult preVisitDirectory(Path dir,
                                                     BasicFileAttributes attrs)
                    throws IOException {

                if (!shouldWatch(dir)) {
                    return FileVisitResult.SKIP_SUBTREE;
                }

                registerDirectory(dir);

                return FileVisitResult.CONTINUE;
            }

        });

    }

    private void registerDirectory(Path directory) throws IOException {

        WatchKey key = directory.register(
                watchService,
                StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_DELETE,
                StandardWatchEventKinds.ENTRY_MODIFY
        );

        watchKeys.put(key, directory);

        System.out.println("Watching : " + directory);
    }

    private void processEvents() {

        while (watching) {

            WatchKey key;

            try {
                key = watchService.take();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }

            Path directory = watchKeys.get(key);

            if (directory == null) {
                key.reset();
                continue;
            }

            for (WatchEvent<?> event : key.pollEvents()) {

                WatchEvent.Kind<?> kind = event.kind();

                if (kind == StandardWatchEventKinds.OVERFLOW) {
                    continue;
                }

                Path relativePath = (Path) event.context();
                Path absolutePath = directory.resolve(relativePath);

                System.out.printf("[%s] %s%n",
                        kind.name(),
                        absolutePath);

                try {

                    if (kind == StandardWatchEventKinds.ENTRY_CREATE) {

                        if (Files.isDirectory(absolutePath)) {

                            registerRecursively(absolutePath);

                        } else {

                            indexService.indexFile(absolutePath);

                        }

                    } else if (kind == StandardWatchEventKinds.ENTRY_MODIFY) {

                    if (Files.isRegularFile(absolutePath)) {

                        long now = System.currentTimeMillis();

                        Long lastEvent =
                                lastModifiedEvents.get(absolutePath);

                        if (lastEvent != null &&
                                now - lastEvent < MODIFY_DEBOUNCE_MS) {

                            log.debug(
                                    "Ignoring duplicate modify event: {}",
                                    absolutePath
                            );

                            continue;
                        }

                        lastModifiedEvents.put(
                                absolutePath,
                                now
                        );

                        indexService.updateFile(
                                absolutePath
                        );
                    }

                    } else if (kind == StandardWatchEventKinds.ENTRY_DELETE) {
                        lastModifiedEvents.remove(absolutePath);
                        indexService.removeFile(absolutePath);

                    }

                } catch (IOException e) {
                    e.printStackTrace();
                }

            }

            boolean valid = key.reset();

            if (!valid) {
                watchKeys.remove(key);
            }

        }

    }

    @PreDestroy
    public void destroy() {

        stopWatching();

        try {
            watchService.close();
        } catch (IOException ignored) {
        }

    }

}

const CACHE_NAME = "rocket-post-offline-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

// Install and cache the essential app files.
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

// Activate the new worker and remove old Rocket Post caches.
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) =>
                        key.startsWith("rocket-post-") &&
                        key !== CACHE_NAME
                    )
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Serve cached files when the network is unavailable.
self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== "GET" ||
        url.origin !== self.location.origin
    ) {
        return;
    }

    // Offline page navigation.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();

                        event.waitUntil(
                            caches.open(CACHE_NAME)
                                .then((cache) =>
                                    cache.put(request, copy)
                                )
                        );
                    }

                    return response;
                })
                .catch(async () => {
                    return (
                        await caches.match(request) ||
                        await caches.match("./index.html") ||
                        Response.error()
                    );
                })
        );

        return;
    }

    // Serve cached CSS, JavaScript and other local files.
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(request).then((response) => {
                if (response.ok && response.type === "basic") {
                    const copy = response.clone();

                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then((cache) =>
                                cache.put(request, copy)
                            )
                    );
                }

                return response;
            });
        })
    );
});

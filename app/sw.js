//Service Worker Polyfill for cross browser support
importScripts('js/serviceworker-cache-polyfill.js');

//Files to Cache using Service Worker
const CACHE_NAME = 'restaurant-reviews-cache-v1';
let filesToCache = [
	'/',
	'/index.html',
	'/restaurant.html',
	'/css/styles.css',
    '/js/main.js',
    '/js/dbhelper.js',
	'/js/restaurant_info.js',
	'/data/restaurants.json',
    '/js/picturefill.min.js',
    '/js/serviceworker-cache-polyfill.js'
];

// Image Caching Section
let imagesToCache = generateImagesArray();
const urlsToCache = filesToCache.concat(imagesToCache);

function generateImagesArray() {
	const imgPath = '/img/';
	const imgSuffixes = ['small', 'medium', 'large'];
	const arr = [];
        for (var i = 1; i < 11; i++) {
		for (var j = 0; j < 3; j++) {
			arr.push(`${imgPath}${i}-${imgSuffixes[j]}.jpg`);
		}
	}
    return arr;
}

// INSTALL EVENT
self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function (cache) {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

// ACTIVATE EVENT
self.addEventListener('activate', function (event) {
	event.waitUntil(caches.keys()
		.then(cacheNames =>
			Promise.all(
				cacheNames
					.filter(cacheName => cacheName !== CACHE_NAME)
					.map(cleanCache)
			)
		));
});


// FETCH EVENT
self.addEventListener('fetch', function (event) {
	console.log('fetch', event.request.url);
	event.respondWith(serveCacheFile(event.request));
});

function serveCacheFile(request) {
	const url = request.url;

	if (shouldFileBeCached(url)) {

		// Serve Cached Files
		return caches.open(CACHE_NAME).then(cache => {
			return cache.match(url).then(response => {
				return response ? response : fetch(request.clone()).then(response => {
					cache.put(url, response.clone());
					return response;
				});
			});
		});

	} else {

		return fetch(request).then(response => {
			return response;
		});
    }
}
function shouldFileBeCached(url) {
	const matchesWithUrlsToCache = urlsToCache.filter(urlToCache => url.indexOf(urlToCache) > -1);
	return matchesWithUrlsToCache.length > 0;
}
function cleanCache(cacheName) {
	return caches.delete(cacheName);
}

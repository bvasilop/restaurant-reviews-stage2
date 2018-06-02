let restaurant;
var map;

document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
});
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
/**
 * Used Picturefill and Grunt Responsive to assist with multiple image sizes
 */
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  const imgUrlArray = [DBHelper.imageUrlForRestaurant(restaurant, 'small'),
                       DBHelper.imageUrlForRestaurant(restaurant, 'medium'),
                       DBHelper.imageUrlForRestaurant(restaurant, 'large')];
  image.src = `${imgUrlArray[1]}`;
  image.srcset = `${imgUrlArray[0]} 620w, ${imgUrlArray[1]} 800w, ${imgUrlArray[2]} 1440w`;
  image.alt = `${restaurant.cuisine_type} restaurant ${restaurant.name}`;
  image.setAttribute('tabindex', '0'); //added tabindex for accessibilty

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.setAttribute('tabindex', '0');//added tabindex for accessibilty
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute('tabindex', '0');//added tabindex for accessibilty
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.setAttribute('role', 'header');//added ARIA role for accessibilty
  title.setAttribute('tabindex', '0');//added tabindex for accessibilty
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const reviewHeader = document.createElement('div');
  reviewHeader.className = 'review-header';
  li.appendChild(reviewHeader);

  const name = document.createElement('h4');
  name.innerHTML = review.name;
  name.className = 'review-author';
  name.setAttribute('role', 'header'); //added ARIA role for accessibilty
  name.setAttribute('tabindex', '0'); //added tabindex for accessibilty
  reviewHeader.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = review.date;
  date.className = 'review-date';
  date.setAttribute('tabindex', '0'); //added tabindex for accessibilty
  reviewHeader.appendChild(date);

  const reviewContent = document.createElement('div');
  reviewContent.className = 'review-content';
  li.appendChild(reviewContent);

  const rating = document.createElement('div');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'rating';
  rating.setAttribute('tabindex', '0'); //added tabindex for accessibilty
  reviewContent.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('tabindex', '0'); //added tabindex for accessibilty
  reviewContent.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', restaurant.name) //added aria-current for accessibilty
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/**
 * Registered Service Worker with console messages
 */
registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed
      console.log('ServiceWorker registration failed: ', err);
    });
  }
}

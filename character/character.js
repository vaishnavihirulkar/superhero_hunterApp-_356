// Get the character ID from session storage
let characterid = sessionStorage.getItem('characterid');

// Variables for authentication
const [ts, apiKey, hash] = [timeStamp, publicKey, Md5hash];

// DOM elements
const image = document.querySelector('.image');
const chracterName = document.querySelector('.details h1');
const bio = document.querySelector('.details p');
const comicsContainer = document.querySelector('.comics-container');
const seriesContainer = document.querySelector('.series-container');
const eventsContainer = document.querySelector('.events-container');
const favBtn = document.querySelector('.fav-btn-container');

// Function to fetch data from the API
async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  let result = data.data.results;
  return result;
}

// Update the header section with character information
function updateHeader(result) {
  let Character = result[0];

  //adding 's' to the path to make it https
  let path = Character.thumbnail.path.split('');
  path.splice(4,0, "s");
  path = path.join('');

  image.innerHTML = `<img src="${path}.${Character.thumbnail.extension}" alt="${Character.name}">`;
  chracterName.innerHTML = Character.name;
  bio.innerHTML = Character.description;
  if (Character.description == "") {
    bio.innerHTML = "No description available";
  }

  // Set the document title to the character name
  document.title = Character.name;

  // Check if the character is in favorites
  let favs = JSON.parse(localStorage.getItem('favs'));
  let i = "";
  if (favs && favs.includes(characterid)) {
    i = "fa-solid";
  } else {
    i = "fa-regular";
  }
  favBtn.innerHTML = `<i class="add-to-fav ${i} fa-heart"></i>`;
}

// Update a section (comics, series, events) with the corresponding data
function updateSection(data, container) {
  container.innerHTML = "";

  // Limit the number of items to display
  data.splice(10);

  for (let element of data){
    let uri = element.resourceURI.split('');
    uri.splice(4,0, "s");
    uri = uri.join('');
    
    let url = `${uri}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;

    getData(url).then((result) => {
      let element = result[0];
      if (element.thumbnail == null || element.thumbnail.path.includes("image_not_available")) {
        comicsContainer.innerHTML += "";
      } else {
        //adding 's' to the path to make it https
        let path = element.thumbnail.path.split('');
        path.splice(4,0, "s");
        path = path.join('');

        container.innerHTML +=
          `<div class="card">
            <div class="card-image">
              <img src="${path}.${element.thumbnail.extension}" alt="">
            </div>
            <div class="card-title">
              <h3>${element.title}</h3>
            </div>
          </div>`;
      }
    });
  }
  
  if (data.length == 0) {
    container.innerHTML = `<h2>No data available</h2>`;
  }
}

// Toggle the favorite status of the character
function toggleFav() {
  let favs = JSON.parse(localStorage.getItem('favs')) || [];
  let element = document.querySelector('.add-to-fav');

  if (favs.includes(characterid)) {
    favs.splice(favs.indexOf(characterid), 1);
  } else {
    favs.push(characterid);
  }

  element.classList.toggle('fa-regular');
  element.classList.toggle('fa-solid');

  localStorage.setItem('favs', JSON.stringify(favs));
}

// Initialize the character details page
function initialise() {
  let Url = `https://gateway.marvel.com:443/v1/public/characters/${characterid}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;

  // Fetch the character details from the API
  getData(Url)
    .then((result) => {
      // Update the header section
      updateHeader(result);
      // Add event listener to the favorite button
      favBtn.addEventListener('click', toggleFav);

      let comics = result[0].comics.items;
      // Update the comics section
      updateSection(comics, comicsContainer);

      let series = result[0].series.items;
      // Update the series section
      updateSection(series, seriesContainer);

      let events = result[0].events.items;
      // Update the events section
      updateSection(events, eventsContainer);
    })
    .catch((error) => {
      console.log(error);
    });
}

// Call the initialise function to start loading the character details
initialise();

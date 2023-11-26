// -------------------------------- Variables --------------------------------
const container = document.querySelector('#container'); //container for the character cards
const input = document.querySelector('#nav-bar input'); //search bar
const loadMoreBtn = document.querySelector('#load-more p'); //load more button
const searchBtn = document.querySelector('#search-bar i'); //search button
const menuBtn = document.querySelector('#hamburger'); //menu button
const navBar = document.querySelector('#nav-bar'); //nav bar
const favourites = document.querySelector('.favorites p'); //favourites button

const[ts, apiKey, hash] = [timeStamp, publicKey, Md5hash]; //importing the variables from api.js
const initialUrl = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}`; 

// List of characterId of popular characters, to be displayed on the home page
const popularCharacters = ['1009610','1009664','1009220','1009351','1009187','1009268','1010743','1010802','1009718','1009407','1011358','1017111'];


// -------------------------------- Functions --------------------------------

// Fetching Data from API, updating the display and handling errors
async function getData(url) {
    try{
        //displaying loading message
        document.querySelector('#error').innerHTML = "Loading...";
        document.querySelector('#error').style.display = "block";
        let response = await fetch(url);
        let json = await response.json();
        let data = await json.data;
        let results = await data.results;

        if(results.length == 0){
            throw new Error("No Results Found");
        }
        else{
            document.querySelector('#error').style.display = "none";
            updateDisplay(results);
        }
    }
    catch(error){
        //displaying error message
        if(error == "TypeError: NetworkError when attempting to fetch resource."){
            document.querySelector('#error').innerHTML = "Check your Internet Connection";
        }
        else{
            document.querySelector('#error').innerHTML = "NO RESULTS FOUND";
        }

        document.querySelector('#error').style.display = "block";
    }
}

// Updating the display with the data fetched from API
// Also checking if the character is already in favourites
function updateDisplay(arr) {
    for(element of arr){
        //adding 's' to the path to make it https
        let path = element.thumbnail.path.split('');
        path.splice(4,0, "s");
        path = path.join('');

        let image = path+'.'+element.thumbnail.extension;
        if(image.includes('image_not_available')){
            continue;
        }
        
        //checking if the character is already in favourites
        let favs = JSON.parse(localStorage.getItem('favs'));
        let i = "";
        if(favs && favs.includes(String(element.id))){
            i = "fa-solid";
        }
        else{
            i = "fa-regular";
        }

        //creating the html for the character card
        html = `
        <div class="superhero-card">
            <a href="character/character.html" target="blank">
                <div class="image">
                    <img class="img" src=${image} alt=${element.name} data-characterid=${element.id}>
                </div>
                <h2 class="name" data-characterid=${element.id}>${element.name}</h2>
            </a>
            <div class="fav-btn-container">
                <i class="add-to-fav ${i} fa-heart" data-characterid=${element.id}></i>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    };
}


//searching for a character, updating the url and calling getData()
function search(){
    if(input.value == "") return;
    let value = input.value.toLowerCase().replace(' ', '-');
    let url = initialUrl+`&limit=50&nameStartsWith=${value}`;

    container.innerHTML = "";
    loaded = 0;
    getData(url);
}

// Toggling the menu, changing the icon and displaying the menu
function toggleMenu(){
    //changing the icon
    if(navBar.classList.contains('active')){
        document.querySelector('#hamburger').innerHTML = `<i class="fa-solid fa-bars"></i>`;
    }
    else{
        document.querySelector('#hamburger').innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    }

    document.querySelector('#nav-bar').classList.toggle('active');
}


// Adding or removing a character from favourites
function toggleFav(element){
    //updating the local storage
    let favs = JSON.parse(localStorage.getItem('favs')) || [];
    let characterid = element.dataset.characterid;

    //adding or removing the character from favourites
    if(favs.includes(characterid)){
        favs.splice(favs.indexOf(characterid), 1);
    }
    else{
        favs.push(characterid);
    }

    element.classList.toggle('fa-regular');
    element.classList.toggle('fa-solid');

    localStorage.setItem('favs', JSON.stringify(favs));

    //removing the character from favourites page if it is already in favourites
    if(document.querySelector(".favorites").classList.contains('border-bottom')){
        showFavourites();
        document.querySelector(".home").classList.toggle('border-bottom');
        document.querySelector(".favorites").classList.toggle('border-bottom');
    }
}


// Displaying the favourites
function showFavourites(){
    document.querySelector(".home").classList.toggle('border-bottom');
    document.querySelector(".favorites").classList.toggle('border-bottom');

    let favs = JSON.parse(localStorage.getItem('favs')) || [];
    container.innerHTML = "";

    if(favs.length == 0){
        console.log(favs);
        container.innerHTML = `<h1 class="no-favs">No Favourites Added</h1>`;
        return;
    }

    for(let i=0; i<favs.length; i++){
        if(favs[i] == null) continue;
        let url = `https://gateway.marvel.com:443/v1/public/characters/${favs[i]}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;
        getData(url);
    }
}

// Loading more characters
let loaded=0;
function loadMore(){
    if(document.querySelector(".favorites").classList.contains('border-bottom')) return;

    let url = initialUrl;
    getData(url+'&offset='+loaded+'&limit=50');
    loaded+=20;
    window.scrollTo(0, document.body.scrollHeight);
}

// Initialising the page with popular characters
function initialise(){
    for(let i=0; i<popularCharacters.length; i++){
        if(popularCharacters[i] == null) continue;
        let url = `https://gateway.marvel.com:443/v1/public/characters/${popularCharacters[i]}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;
        getData(url);
    }

    document.addEventListener('click', handleClickEvents);
}


// -------------------------------- Event Listeners --------------------------------
function handleClickEvents(e){
    if(e.target == loadMoreBtn){
        loadMore();
    }
    else if(e.target == searchBtn){
        search();
    }
    else if(e.target == menuBtn.children[0]){
        toggleMenu();
    }
    else if(e.target.classList.contains('add-to-fav')){
        toggleFav(e.target);
    }
    else if(e.target.classList.contains('name') || e.target.classList.contains('img')){
        sessionStorage.setItem('characterid', e.target.dataset.characterid);
    }
    else if(e.target == favourites){
        showFavourites();
    }
}


// -------------------------------- Main --------------------------------
initialise();
import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

class PixabayApi {
  BASE_URL = 'https://pixabay.com/api/';
  API_KEY = '35978039-e1b43f028e4248e636af167c6';
  
  constructor() {
    this.page = 1;
    this.searchQuery = '';
    this.perPage = 40;
    this.totalPage = 1;
    this.searched = 0;
  }

  async getRequest() {
    const parameters = {
      key: this.API_KEY,
      q: this.searchQuery,
      page: this.page,
      per_page: this.perPage,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    };

    try {
      const response = await axios.get(this.BASE_URL, { params: parameters });
      this.searched = response.data.total;
      this.totalPage = Math.ceil(response.data.total / this.perPage);
      return response.data.hits;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const pixabayApi = new PixabayApi();

const gallery = document.querySelector('.gallery');
const searchBtn = document.querySelector('.search-btn');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener("submit", onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  clearMarkup();
  hideLoadMoreButton();
  pixabayApi.page = 1;
 pixabayApi.searchQuery = searchInput.value;
  const data = await pixabayApi.getRequest();
  const fullString = renderImages(data);
    insertMarkup(fullString);
  if (pixabayApi.page < pixabayApi.totalPage) {
    pixabayApi.page += 1;      
      lightbox.refresh();
      showLoadMore();
  }
  if (pixabayApi.searched === 0) {
  Notify.failure('Sorry, there are no images matching your search query. Please try again.');
} else {
  Notify.info(`Hooray! We found ${pixabayApi.searched} images.`);
}
}


function showLoadMore() {
  loadMoreBtn.classList.remove('is-hidden');
    loadMoreBtn.addEventListener('click', onBtnLoadClick); 
}

function hideLoadMoreButton() {
  loadMoreBtn.classList.add('is-hidden');
    loadMoreBtn.removeEventListener('click', onBtnLoadClick);
}

async function onBtnLoadClick() {
  hideLoadMoreButton();
  const data = await pixabayApi.getRequest();
  const fullString = renderImages(data);
    insertMarkup(fullString);

    lightbox.refresh();
    
  if (pixabayApi.page === pixabayApi.totalPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  if (pixabayApi.page < pixabayApi.totalPage) {
    pixabayApi.page += 1;
    showLoadMore();
    }
const firstCard = document.querySelector(".gallery").firstElementChild;
  if (firstCard !== null) {
    const { height: cardHeight } = firstCard.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });
  }
}

function insertMarkup(fullMarkup) { 
        gallery.insertAdjacentHTML('beforeend', fullMarkup);
}
function clearMarkup() {
    PixabayApi.page = 1;
    gallery.innerHTML = '';
}

 
function renderImages(images) {
    const cardsMarkup = "";
    if (images.length === 0) {
        return cardsMarkup;
    }
    const cardMarkup = images.map(el => `<div class="photo-card">
   <a href=${el.largeImageURL}>
      <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" width="640" height="360"/>
   </a>
      <div class="info">
        <p class="info-item"><b>Likes: </b>${el.likes}</p>
        <p class="info-item"><b>Views: </b>${el.views}</p>
        <p class="info-item"><b>Comments: </b>${el.comments}</p>
        <p class="info-item"><b>Downloads: </b>${el.downloads}</p>
      </div>
    
  </div>`).join('');
    return cardMarkup;
}



import axios from 'axios';
import { Notify } from 'notiflix';

class PixabayApi {
  BASE_URL = 'https://pixabay.com/api/';
  API_KEY = '35978039-e1b43f028e4248e636af167c6';
  

  constructor() {
    this.page = 1;
    this.searchQuery = '';
    this.perPage = 40;
    this.totalPage = 1;
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

      if (response.data.total === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      } else {
        Notify.info(`Hooray! We found ${response.data.total} images.`);
      }

      this.totalPage = Math.ceil(response.data.total / this.perPage);
      return response.data.hits;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const pixabayApi = new PixabayApi();
pixabayApi.getRequest();


const searchBtn = document.querySelector('.search-btn');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');

const renderImages = (images) => {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    if (images.length === 0) {
        return;
    }
     
    function cardsMarkup(array) {
        array.map(el => {
            return `<a href=${el.largeImageURL}>
    <div class="photo-card">
      <img src="${el.largeImageURL}" alt="${el.tags}" loading="lazy" width="640" height="360"/>
      <div class="info">
        <p class="info-item"><b>Likes: </b>${el.likes}</p>
        <p class="info-item"><b>Views: </b>${el.views}</p>
        <p class="info-item"><b>Comments: </b>${el.comments}</p>
        <p class="info-item"><b>Downloads: </b>${el.downloads}</p>
      </div>
    </div>
  </a>`
        });

        
        return cardsMarkup.join('');
    }


    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            pixabayApi.searchQuery = searchInput.value;
            const images = await pixabayApi.getRequest();
            renderImages(images);
        } catch (error) {
            Notify.failure('Oops, something went wrong. Please try again later.');
        }
    });
}

const API_KEY = '38274968-dd4a67cba6734c16ac71217cd';
import axios from 'axios';

export default class NewPixabyService {
  constructor() {
    this.category = '';
    this.currentPage = 1;
    this.currentHits = 0;
    this.currentMaxHits = 0;
  }
  async fetchHits() {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${this.category}&per_page=40&page=${this.currentPage}&orientation="horizontal"&safesearch="true"&image_type="photo"`
    );

    const promise = await response.data;

    this.currentHits += 40;
    this.currentMaxHits = promise.totalHits;

    const hits = await promise.hits;

    this.currentPage += 1;
    return hits;
  }

  clearCurrentHits() {
    this.currentHits = 0;
  }

  clearCurrentPage() {
    this.currentPage = 1;
  }
}

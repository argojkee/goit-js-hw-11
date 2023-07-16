import PixabyService from './pixaby-service/pixaby-servise';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a');

const NewPixabyService = new PixabyService();

const formEl = document.querySelector('#search-form');
const btnLoadMoreEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

formEl.addEventListener('submit', onSubmitForm);
btnLoadMoreEl.addEventListener('click', onLoadMoreClick);

async function onSubmitForm(e) {
  event.preventDefault();

  if (e.currentTarget.searchQuery.value.trim() === '') {
    return Notify.failure(`Please, enter valid value`);
  }
  if (e.currentTarget.searchQuery.value.trim() === NewPixabyService.category) {
    return Notify.failure(`It's alredy current category`);
  }
  hiddenLoadMoreBtn();

  NewPixabyService.category = e.currentTarget.searchQuery.value;
  try {
    NewPixabyService.clearCurrentHits();
    NewPixabyService.clearCurrentPage();
    clearMarkup();

    const arraySelectedCategory = await NewPixabyService.fetchHits();

    if (NewPixabyService.currentMaxHits === 0) {
      return Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }

    Notify.success(
      `Hooray! We found ${NewPixabyService.currentMaxHits} images.`
    );

    const galleryItemsString = makeMarkUp(arraySelectedCategory);

    addGalleryItemsinUi(galleryItemsString);
    lightbox.refresh();

    if (NewPixabyService.currentMaxHits > 40) {
      showLoadMoreBtn();
    } else {
      Notify.failure(
        `"We're sorry, but you've reached the end of search results."`
      );
    }
  } catch {
    Notify.failure(
      `Oops... Something went wrong. Please reload the page and try again.`
    );
  }
}

async function onLoadMoreClick() {
  try {
    const arraySelectedCategory = await NewPixabyService.fetchHits();
    const galleryItemsString = makeMarkUp(arraySelectedCategory);
    addGalleryItemsinUi(galleryItemsString);
    lightbox.refresh();
    smoothScroll();

    if (NewPixabyService.currentHits >= NewPixabyService.currentMaxHits) {
      hiddenLoadMoreBtn();
      Notify.failure(
        `"We're sorry, but you've reached the end of search results."`
      );
    }
  } catch {
    Notify.failure(
      `Oops... Something went wrong. Please reload the page and try again.`
    );
  }
}

function makeMarkUp(array) {
  let markupString = '';

  array.forEach(
    ({
      webformatURL,
      tags,
      likes,
      views,
      comments,
      downloads,
      largeImageURL,
    }) => {
      markupString += `<div class="photo-card gallery__item">
    <a class="gallery__link" href=${largeImageURL}>
  <img class="gallery__image" src=${webformatURL} alt=${tags} loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
</div>`;
    }
  );

  return markupString;
}

function addGalleryItemsinUi(string) {
  galleryEl.insertAdjacentHTML('beforeend', string);
}

function clearMarkup() {
  galleryEl.innerHTML = '';
}

function showLoadMoreBtn() {
  btnLoadMoreEl.classList.remove('is-hidden');
}

function hiddenLoadMoreBtn() {
  btnLoadMoreEl.classList.add('is-hidden');
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2.5,
    behavior: 'smooth',
  });
}

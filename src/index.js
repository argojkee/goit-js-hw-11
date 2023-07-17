import PixabyService from './api-service/pixaby-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a');
const NewPixabyService = new PixabyService();

const formEl = document.querySelector('#search-form');
const btnLoadMoreEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

formEl.addEventListener('submit', onSubmitForm);
btnLoadMoreEl.addEventListener('click', onLoadMoreBtn);

async function onSubmitForm(e) {
  event.preventDefault();

  const userRequest = e.currentTarget.searchQuery.value;

  if (userRequest.trim() === '') {
    return Notify.failure(`Please, enter valid value`);
  }

  if (
    userRequest.toLowerCase().trim() ===
    NewPixabyService.category.toLowerCase().trim()
  ) {
    return Notify.failure(`It's alredy current category`);
  }

  hiddenLoadMoreBtn();

  try {
    NewPixabyService.category = userRequest;
    NewPixabyService.clearCurrentHits();
    NewPixabyService.clearCurrentPage();
    clearMarkup();

    const collectionItems = await NewPixabyService.fetchHits();

    if (NewPixabyService.currentMaxHits === 0) {
      return Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }

    Notify.success(
      `Hooray! We found ${NewPixabyService.currentMaxHits} images.`
    );

    const galleryMarkup = makeMarkUp(collectionItems);

    addGalleryItemsinUi(galleryMarkup);
    lightbox.refresh();

    if (NewPixabyService.currentMaxHits > NewPixabyService.onPage) {
      showLoadMoreBtn();
    } else {
      Notify.failure(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  } catch {
    Notify.failure(
      `Oops... Something went wrong. Please reload the page and try again.`
    );
  }
}

async function onLoadMoreBtn() {
  try {
    const collectionItems = await NewPixabyService.fetchHits();
    const galleryMarkup = makeMarkUp(collectionItems);
    addGalleryItemsinUi(galleryMarkup);
    lightbox.refresh();
    smoothScroll();

    if (NewPixabyService.currentHits >= NewPixabyService.currentMaxHits) {
      hiddenLoadMoreBtn();

      Notify.failure(
        `"We're sorry, but you've reached the end of search results."`
      );
    }
  } catch (error) {
    Notify.failure(
      `Oops... Something went wrong. Please reload the page and try again.`
    );
  }
}
// }

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

// async function checkPosition() {
//   const height = document.body.offsetHeight;
//   const screenHeight = window.innerHeight;

//   const scrolled = window.scrollY;

//   const threshold = height - screenHeight / 4;

//   const position = scrolled + screenHeight;

//   if (position >= threshold) {
//     await onLoadMoreBtn();
//   }
// }

// function throttle(callee, timeout) {
//   let timer = null;

//   return function perform(...args) {
//     if (timer) return;

//     timer = setTimeout(() => {
//       callee(...args);

//       clearTimeout(timer);
//       timer = null;
//     }, timeout);
//   };
// }

//       window.removeEventListener('scroll', checkPosition);
//       window.removeEventListener('resize', checkPosition);

import { getContent } from '../content.js';

function createPage({ tag, title, subtitle, count }) {
  const page = document.createElement('section');
  page.className = 'media-page';

  const heading = document.createElement('header');
  heading.className = 'media-page__heading';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'media-page__eyebrow';
  eyebrow.textContent = tag;

  const headingRow = document.createElement('div');
  headingRow.className = 'media-page__heading-row';

  const titleElement = document.createElement('h1');
  titleElement.textContent = title;

  const countElement = document.createElement('span');
  countElement.className = 'media-page__count';
  countElement.textContent = count;

  const subtitleElement = document.createElement('p');
  subtitleElement.className = 'media-page__subtitle';
  subtitleElement.textContent = subtitle;

  headingRow.append(titleElement, countElement);
  heading.append(eyebrow, headingRow, subtitleElement);

  const content = document.createElement('div');
  content.className = 'media-page__content';
  page.append(heading, content);
  return { page, content };
}

function assetMoment(path) {
  const match = path.match(/(\d{4})-(\d{2})-(\d{2}) at (\d{1,2})\.(\d{2})\.\d{2} (AM|PM)/);
  if (!match) return '';
  const [, year, month, day, hour, minute, period] = match;
  const monthName = new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(Number(year), Number(month) - 1, 1));
  return `${Number(day)} ${monthName} ${year} · ${hour}:${minute} ${period}`;
}

function addNextButton(content, label, onNext) {
  const actions = document.createElement('div');
  actions.className = 'media-page__actions';
  const nextButton = document.createElement('button');
  nextButton.className = 'media-page__next';
  nextButton.type = 'button';
  nextButton.textContent = label;
  nextButton.addEventListener('click', () => onNext?.());
  actions.append(nextButton);
  content.append(actions);
}

export function renderPhotoGallery(container, onNext) {
  const gallery = getContent()?.gallery || {};
  const photos = Array.isArray(gallery.items) ? gallery.items : [];
  const formatText = (template, values) => Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
  const { page, content } = createPage({
    tag: gallery.stepTag || 'THE SCRAPBOOK',
    title: gallery.title || 'Our little moments',
    subtitle: gallery.subtitle || 'Every photo, together in one place.',
    count: formatText(gallery.photoCountLabel || '{count} photos', { count: photos.length })
  });

  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  const lightbox = document.createElement('dialog');
  lightbox.className = 'photo-lightbox';
  const lightboxClose = document.createElement('button');
  lightboxClose.className = 'photo-lightbox__close';
  lightboxClose.type = 'button';
  lightboxClose.textContent = gallery.closeViewerLabel || 'Close photo';
  lightboxClose.addEventListener('click', () => lightbox.close());
  const enlargedImage = document.createElement('img');
  enlargedImage.alt = '';
  const lightboxCaption = document.createElement('p');
  lightbox.append(lightboxClose, enlargedImage, lightboxCaption);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  photos.forEach((photo, index) => {
    const src = photo.src || '';
    const title = photo.title || `Photo ${String(index + 1).padStart(2, '0')}`;
    const figure = document.createElement('figure');
    figure.className = 'photo-card';

    const openButton = document.createElement('button');
    openButton.className = 'photo-card__image-button';
    openButton.type = 'button';
    openButton.setAttribute('aria-label', `View ${title} full size`);

    const image = document.createElement('img');
    image.src = src;
    image.alt = formatText(gallery.photoAltText || 'Photo {number} from the birthday photo collection', {
      number: index + 1,
      title
    });
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.alt = `${title} could not be loaded`;
      image.classList.add('media-image--unavailable');
    });
    openButton.append(image);
    openButton.addEventListener('click', () => {
      enlargedImage.src = src;
      enlargedImage.alt = image.alt;
      lightboxCaption.textContent = `${title} · ${photo.date || assetMoment(src)}${photo.caption ? ` · ${photo.caption}` : ''}`;
      lightbox.showModal();
    });

    const caption = document.createElement('figcaption');
    const name = document.createElement('span');
    name.className = 'media-card__title';
    name.textContent = title;
    const moment = document.createElement('span');
    moment.className = 'media-card__meta';
    moment.textContent = photo.date || assetMoment(src);
    caption.append(name, moment);
    if (photo.caption) {
      const photoCaption = document.createElement('span');
      photoCaption.className = 'media-card__meta';
      photoCaption.textContent = photo.caption;
      caption.append(photoCaption);
    }
    figure.append(openButton, caption);
    grid.append(figure);
  });

  content.append(grid, lightbox);
  addNextButton(content, gallery.continueButton || 'See our videos →', onNext);
  container.replaceChildren(page);
}

export function renderVideoGallery(container, onNext) {
  const videoPage = getContent()?.videos || {};
  const videos = Array.isArray(videoPage.items) ? videoPage.items : [];
  const formatText = (template, count) => template.replaceAll('{count}', String(count));
  const { page, content } = createPage({
    tag: videoPage.stepTag || 'LITTLE MOMENTS IN MOTION',
    title: videoPage.title || 'Video memories',
    subtitle: videoPage.subtitle || 'Play every clip with the controls below.',
    count: formatText(videoPage.videoCountLabel || '{count} videos', videos.length)
  });

  const grid = document.createElement('div');
  grid.className = 'video-grid';
  const players = [];

  videos.forEach((item, index) => {
    const src = item.src || '';
    const title = item.title || `Video memory ${String(index + 1).padStart(2, '0')}`;
    const card = document.createElement('article');
    card.className = 'video-card';

    const video = document.createElement('video');
    video.className = 'video-card__player';
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', `${title}, birthday video`);
    video.addEventListener('play', () => {
      players.forEach((other) => {
        if (other !== video) other.pause();
      });
    });

    const details = document.createElement('div');
    details.className = 'media-card__details';
    const name = document.createElement('h2');
    name.className = 'media-card__title';
    name.textContent = title;
    const moment = document.createElement('p');
    moment.className = 'media-card__meta';
    moment.textContent = item.date || assetMoment(src);
    const error = document.createElement('p');
    error.className = 'media-error';
    error.setAttribute('role', 'status');
    error.hidden = true;
    error.textContent = videoPage.videoError || 'This video could not be played in this browser.';
    video.addEventListener('error', () => {
      error.hidden = false;
    });

    details.append(name);
    if (moment.textContent || item.caption) details.append(moment);
    if (item.caption) {
      const caption = document.createElement('p');
      caption.className = 'media-card__meta';
      caption.textContent = item.caption;
      details.append(caption);
    }
    details.append(error);
    card.append(video, details);
    grid.append(card);
    players.push(video);
  });

  content.append(grid);
  addNextButton(content, videoPage.continueButton || 'Continue the birthday journey →', onNext);
  container.replaceChildren(page);

  return () => players.forEach((player) => player.pause());
}

export function renderAudioGallery(container, onNext) {
  const contentData = getContent() || {};
  const voice = contentData.voice || {};
  const tracks = Array.isArray(voice.tracks) ? voice.tracks : [];
  const formatText = (template, count) => template.replaceAll('{count}', String(count));
  const { page, content } = createPage({
    tag: voice.stepTag || 'A LITTLE SOMETHING TO HEAR',
    title: voice.title || 'Voice notes for you',
    subtitle: voice.subtitle || 'Pick a recording, then press play.',
    count: formatText(voice.trackCountLabel || '{count} audio tracks', tracks.length)
  });

  const playerCard = document.createElement('section');
  playerCard.className = 'audio-card';
  playerCard.setAttribute('aria-label', voice.audioPlayerLabel || 'Audio player');
  const selectedTitle = document.createElement('h2');
  selectedTitle.className = 'audio-card__title';
  const selectedMoment = document.createElement('p');
  selectedMoment.className = 'media-card__meta';
  const audio = document.createElement('audio');
  audio.className = 'audio-player';
  audio.controls = true;
  audio.preload = 'metadata';
  audio.setAttribute('aria-label', voice.audioPlayerLabel || 'Selected birthday audio track');
  const status = document.createElement('p');
  status.className = 'media-error';
  status.setAttribute('role', 'status');
  status.hidden = true;
  status.textContent = voice.audioError || 'This audio track could not be played in this browser.';
  audio.addEventListener('error', () => {
    status.hidden = false;
  });

  const trackList = document.createElement('div');
  trackList.className = 'audio-track-list';
  trackList.setAttribute('aria-label', voice.trackListLabel || 'Choose an audio track');

  function selectTrack(track, index, button) {
    audio.pause();
    audio.src = track.src;
    audio.load();
    selectedTitle.textContent = track.title || `Voice note ${index + 1}`;
    selectedMoment.textContent = track.date || assetMoment(track.src);
    status.hidden = true;
    trackList.querySelectorAll('button').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
  }

  tracks.forEach((track, index) => {
    const button = document.createElement('button');
    button.className = 'audio-track';
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    const trackTitle = document.createElement('span');
    trackTitle.className = 'media-card__title';
    trackTitle.textContent = track.title || `Voice note ${index + 1}`;
    const moment = document.createElement('span');
    moment.className = 'media-card__meta';
    moment.textContent = track.date || assetMoment(track.src);
    button.append(trackTitle, moment);
    button.addEventListener('click', () => selectTrack(track, index, button));
    trackList.append(button);
  });

  playerCard.append(selectedTitle, selectedMoment, audio, status);
  content.append(playerCard, trackList);

  if (tracks.length > 0) {
    selectTrack(tracks[0], 0, trackList.querySelector('button'));
  } else {
    const emptyState = document.createElement('p');
    emptyState.className = 'media-empty';
    emptyState.textContent = voice.emptyTracksMessage || 'No audio tracks have been added yet.';
    content.append(emptyState);
  }

  addNextButton(content, voice.continue || 'Read the birthday letter →', onNext);
  container.replaceChildren(page);
  return () => audio.pause();
}

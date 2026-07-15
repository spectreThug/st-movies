// --- API Base URL Auto-Detection ---
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? window.location.origin
  : 'https://st-movies.vercel.app';

const TMDB_IMAGE_BASE = 'https://media.themoviedb.org';

// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const gridTitle = document.getElementById('grid-title');
const trendingSection = document.getElementById('trending-section');
const trendingGrid = document.getElementById('trending-grid');
const heroSection = document.getElementById('hero-section');
const heroBanner = document.getElementById('hero-banner');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const heroPlayBtn = document.getElementById('hero-play-btn');

// Modal Elements
const detailsModal = document.getElementById('details-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalTagline = document.getElementById('modal-tagline');
const modalYear = document.getElementById('modal-year');
const modalCertification = document.getElementById('modal-certification');
const modalRuntime = document.getElementById('modal-runtime');
const modalRating = document.getElementById('modal-rating');
const modalGenres = document.getElementById('modal-genres');
const modalOverview = document.getElementById('modal-overview');
const modalCast = document.getElementById('modal-cast');
const modalTrailerSection = document.getElementById('modal-trailer-section');
const modalTrailerIframe = document.getElementById('modal-trailer-iframe');
const modalStreams = document.getElementById('modal-streams');

// --- Global States ---
let searchDebounceTimeout = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  // Load default popular and trending movies
  fetchInitialData();
  
  // Set up search listener
  searchInput.addEventListener('input', handleSearchInput);
  
  // Set up modal close listeners
  modalCloseBtn.addEventListener('click', closeModal);
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) closeModal();
  });
  
  // Set up hero spotlight click listener
  heroPlayBtn.addEventListener('click', () => {
    const movieId = heroPlayBtn.getAttribute('data-id');
    const movieName = heroPlayBtn.getAttribute('data-name');
    if (movieId && movieName) {
      openMovieDetails(movieId, movieName);
    }
  });
  
  // Handle keyboard ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailsModal.classList.contains('active')) {
      closeModal();
    }
  });
});

// --- Fetch Initial Data (Popular & Trending) ---
async function fetchInitialData() {
  trendingSection.style.display = 'block';
  renderShimmers(trendingGrid, 6);
  renderShimmers(movieGrid, 8);
  
  fetchPopularMovies();
  fetchTrendingMovies();
}

// --- Fetch Popular Movies ---
async function fetchPopularMovies() {
  try {
    const response = await fetch(`${API_BASE}/api/movies/popular`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      renderMovieGrid(result.data, movieGrid);
    } else {
      renderError("No popular movies found.", movieGrid);
    }
  } catch (error) {
    console.error("Error loading popular movies:", error);
    renderError("Failed to connect to movie server.", movieGrid);
  }
}

// --- Fetch Trending Movies ---
async function fetchTrendingMovies() {
  try {
    const response = await fetch(`${API_BASE}/api/movies/trending`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      renderMovieGrid(result.data, trendingGrid);
      
      // Update Hero Section with the top trending movie
      const movie = result.data[0];
      heroTitle.textContent = movie.name;
      heroDesc.textContent = "Loading description...";
      heroPlayBtn.setAttribute('data-id', movie.id);
      heroPlayBtn.setAttribute('data-name', movie.name);
      
      // Fetch this specific movie's details to get high-res backdrop & overview
      fetchHeroSpotlightDetails(movie.id, movie.name);
    } else {
      renderError("No trending movies found.", trendingGrid);
    }
  } catch (error) {
    console.error("Error loading trending movies:", error);
    renderError("Failed to load trending movies.", trendingGrid);
  }
}

// --- Fetch Hero Spotlight Details (Backdrop & Overview) ---
async function fetchHeroSpotlightDetails(movieId, movieName) {
  try {
    const cleanMovieName = movieName.replace(/[:]/g, ''); // strip colons
    const response = await fetch(`${API_BASE}/api/movies/details/${movieId}/${encodeURIComponent(cleanMovieName)}/${encodeURIComponent(movieName)}`);
    const result = await response.json();
    if (result.success && result.data) {
      const details = result.data;
      if (details.overview) {
        heroDesc.textContent = details.overview;
      }
      if (details.backgroundImage) {
        heroBanner.style.background = `linear-gradient(to right, rgba(11, 15, 25, 0.95), rgba(11, 15, 25, 0.3)), url('${details.backgroundImage}') center/cover no-repeat`;
      }
    }
  } catch (e) {
    console.error("Failed to load hero spotlight details:", e);
  }
}

// --- Handle Search Input (With Debounce) ---
function handleSearchInput(e) {
  const query = e.target.value.trim();
  
  clearTimeout(searchDebounceTimeout);
  
  if (query.length === 0) {
    gridTitle.textContent = "Popular Results";
    fetchInitialData();
    return;
  }
  
  // Hide trending section when searching
  trendingSection.style.display = 'none';
  
  // Wait 400ms after user stops typing before making request
  searchDebounceTimeout = setTimeout(() => {
    gridTitle.textContent = `Search Results for "${query}"`;
    searchMovies(query);
  }, 400);
}

// --- Search Movies ---
async function searchMovies(query) {
  renderShimmers();
  try {
    const response = await fetch(`${API_BASE}/api/movies/search/${encodeURIComponent(query)}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      renderMovieGrid(result.data);
    } else {
      renderEmpty("No matching movies found.");
    }
  } catch (error) {
    console.error("Search failed:", error);
    renderError("An error occurred while searching. Make sure the server is running.");
  }
}

// --- Render Movie Cards Grid ---
function renderMovieGrid(movies, targetElement = movieGrid) {
  targetElement.innerHTML = '';
  
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Fallback poster image
    const posterUrl = movie.image 
      ? `${TMDB_IMAGE_BASE}${movie.image}` 
      : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80';
      
    card.innerHTML = `
      <div class="card-poster-wrapper">
        <img class="card-poster" src="${posterUrl}" alt="${movie.name}" loading="lazy">
        <span class="card-year-badge">${movie.year || 'N/A'}</span>
      </div>
      <div class="card-info">
        <h3 class="card-title">${movie.name}</h3>
        <p class="card-overview">${movie.overview || 'No overview description available.'}</p>
      </div>
    `;
    
    // Open details on click
    card.addEventListener('click', () => {
      openMovieDetails(movie.id, movie.name);
    });
    
    targetElement.appendChild(card);
  });
}

// --- Open Movie Details Modal ---
async function openMovieDetails(movieId, movieName) {
  // Show details modal and clear old content
  detailsModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
  
  // Set placeholder loading states
  modalTitle.textContent = "Loading Movie Details...";
  modalTagline.textContent = "";
  modalOverview.textContent = "";
  modalGenres.innerHTML = "";
  modalCast.innerHTML = "";
  modalStreams.innerHTML = "";
  modalTrailerSection.style.display = 'none';
  modalTrailerIframe.src = '';
  modalBackdrop.style.backgroundImage = 'none';
  modalPoster.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80';
  modalRating.textContent = '--';
  modalRating.style.borderColor = 'var(--border-color)';
  modalYear.textContent = '----';
  modalCertification.textContent = '--';
  modalRuntime.textContent = '--h --m';
  
  try {
    // 1. Fetch details
    const cleanMovieName = movieName.replace(/[:]/g, ''); // strip colons
    const detailsUrl = `${API_BASE}/api/movies/details/${movieId}/${encodeURIComponent(cleanMovieName)}/${encodeURIComponent(movieName)}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsResult = await detailsResponse.json();
    
    if (detailsResult.success && detailsResult.data) {
      const details = detailsResult.data;
      
      // Populate Details
      modalTitle.textContent = details.name;
      modalTagline.textContent = details.quote ? `"${details.quote}"` : "";
      modalOverview.textContent = details.overview || "No overview description available.";
      
      // Poster & Backdrop
      if (details.image) modalPoster.src = details.image;
      if (details.backgroundImage) {
        modalBackdrop.style.backgroundImage = `url('${details.backgroundImage}')`;
      }
      
      // Year / Release Date
      const year = details.release_date ? details.release_date.match(/\d{4}/) : null;
      modalYear.textContent = year ? year[0] : (details.release_date || 'N/A');
      
      // Certification
      modalCertification.textContent = details.certification || 'G';
      
      // Runtime
      modalRuntime.innerHTML = `<i class="fa-regular fa-clock"></i> ${details.movieLength || 'N/A'}`;
      
      // Rating Circle
      const rate = details.rate || 0;
      modalRating.textContent = `${rate}%`;
      if (rate >= 70) {
        modalRating.style.borderColor = 'var(--success)';
        modalRating.style.color = 'var(--success)';
      } else if (rate >= 40) {
        modalRating.style.borderColor = 'var(--warning)';
        modalRating.style.color = 'var(--warning)';
      } else {
        modalRating.style.borderColor = 'var(--error)';
        modalRating.style.color = 'var(--error)';
      }
      
      // Genres
      if (details.categories && details.categories.length > 0) {
        details.categories.forEach(genre => {
          const badge = document.createElement('span');
          badge.className = 'genre-badge';
          badge.textContent = genre;
          modalGenres.appendChild(badge);
        });
      }
      
      // Cast list (with clickable links to profile details)
      if (details.cast && details.cast.length > 0) {
        details.cast.forEach(actor => {
          const castCard = document.createElement('a');
          castCard.className = 'cast-card';
          castCard.href = actor.actorImage || '#';
          castCard.target = '_blank';
          castCard.rel = 'noopener';
          
          // Get initials as placeholder for profile pic
          const initials = actor.actorName
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
            
          castCard.innerHTML = `
            <div class="cast-photo" style="display: flex; align-items: center; justify-content: center; background-color: var(--bg-primary); color: var(--text-secondary); font-weight: 700; font-size: 0.9rem;">
              ${initials}
            </div>
            <div class="cast-name">${actor.actorName}</div>
            <div class="cast-character">${actor.character || 'Cast'}</div>
          `;
          
          modalCast.appendChild(castCard);
        });
      } else {
        modalCast.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.9rem;">No cast list details available.</span>';
      }
      
      // YouTube Trailer
      if (details.trailer) {
        // Extract YouTube ID if it is a full link
        let videoId = details.trailer.split('youtu.be/')[1];
        if (!videoId && details.trailer.includes('v=')) {
          videoId = details.trailer.split('v=')[1].split('&')[0];
        }
        
        if (videoId) {
          modalTrailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
          modalTrailerSection.style.display = 'block';
        }
      }
    } else {
      modalTitle.textContent = "Failed to load movie details.";
    }
    
    // 2. Fetch stream links (using movieName and year)
    let searchYear = '2019'; // default fallback
    if (detailsResult.success && detailsResult.data && detailsResult.data.release_date) {
      const yearMatch = detailsResult.data.release_date.match(/\d{4}/);
      if (yearMatch) searchYear = yearMatch[0];
    }
    
    const streamUrl = `${API_BASE}/api/movies/stream/${encodeURIComponent(movieName)}/${searchYear}`;
    const streamResponse = await fetch(streamUrl);
    const streamResult = await streamResponse.json();
    
    if (streamResult.success && streamResult.data && streamResult.data.length > 0) {
      streamResult.data.forEach(stream => {
        const card = document.createElement('div');
        card.className = 'stream-card';
        
        card.innerHTML = `
          <div class="stream-badge">${stream.quality}</div>
          <div class="stream-actions">
            <button class="btn-action copy-link" title="Copy Torrent Link" data-url="${stream.url}">
              <i class="fa-solid fa-copy"></i>
            </button>
            <a href="${stream.url}" class="btn-action download" title="Download Torrent File" target="_blank" rel="noopener">
              <i class="fa-solid fa-download"></i>
            </a>
          </div>
        `;
        
        // Copy to clipboard handler
        const copyBtn = card.querySelector('.copy-link');
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          copyToClipboard(stream.url, copyBtn);
        });
        
        modalStreams.appendChild(card);
      });
    } else {
      modalStreams.innerHTML = `
        <div class="message-box" style="margin: 0; padding: 1.5rem; max-width: 100%;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <p style="font-size: 0.85rem;">No direct streaming downloads available for this movie.</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error("Failed to load details:", error);
    modalTitle.textContent = "Network Error loading details.";
  }
}

// --- Close Details Modal ---
function closeModal() {
  detailsModal.classList.remove('active');
  document.body.style.overflow = 'auto'; // Unlock background scrolling
  
  // Stop playing video by resetting source
  modalTrailerIframe.src = '';
}

// --- Copy Torrent URL to Clipboard Utility ---
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    // Show copy visual feedback
    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = '<i class="fa-solid fa-check"></i>';
    btnElement.classList.add('copied');
    
    setTimeout(() => {
      btnElement.innerHTML = originalHtml;
      btnElement.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Could not copy link:', err);
  });
}

// --- Render Loading Shimmers ---
function renderShimmers(targetGrid = movieGrid, count = 8) {
  targetGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'movie-card shimmer-card';
    card.innerHTML = `
      <div class="shimmer-poster shimmer"></div>
      <div class="card-info">
        <div class="shimmer-title shimmer"></div>
        <div class="shimmer-text shimmer" style="margin-top: 10px;"></div>
        <div class="shimmer-text shimmer" style="margin-top: 5px; width: 60%;"></div>
      </div>
    `;
    targetGrid.appendChild(card);
  }
}

// --- Render Empty Search Result Message ---
function renderEmpty(message, targetGrid = movieGrid) {
  targetGrid.innerHTML = `
    <div class="message-box">
      <i class="fa-solid fa-circle-question"></i>
      <h3>No Movies Found</h3>
      <p>${message}</p>
    </div>
  `;
}

// --- Render Server Error Message ---
function renderError(message, targetGrid = movieGrid) {
  targetGrid.innerHTML = `
    <div class="message-box">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>Connection Failed</h3>
      <p>${message}</p>
    </div>
  `;
}

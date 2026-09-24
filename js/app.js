// ========================================
// DATA & KONSTANTER
// ========================================

const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

const STORAGE_KEY = "favs";

// ========================================
// DOM-ELEMENTER
// ========================================

const searchInput = document.getElementById("search-input");
const gameList = document.getElementById("game-list");

const openFiltersButton = document.getElementById("open-filters");
const closeFiltersButton = document.getElementById("close-filters");
const filterPanel = document.getElementById("filter-panel");
const showResultsButton = document.getElementById("show-results");
const clearFiltersButton = document.getElementById("clear-filters-pill");

const activeFilters = document.getElementById("active-filters");
const activeFiltersList = document.getElementById("active-filters-list");

const modal = document.getElementById("game-modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalDescription = document.getElementById("modal-desc");
const modalDetails = document.getElementById("modal-details");
const modalRulesWrap = document.getElementById("modal-rules-wrap");
const modalRules = document.getElementById("modal-rules");
const rulesButton = document.getElementById("rules-toggle");
const rulesContent = document.getElementById("rules-content");

const favouriteFeedback = document.getElementById("favourite-feedback");
const favouriteFeedbackText = document.getElementById(
  "favourite-feedback-text",
);
const closeFavouriteFeedback = document.getElementById(
  "close-favourite-feedback",
);

// ========================================
// STATE
// ========================================

let games = [];

let favourites = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

let selectedGenre = "all";
let selectedPlayers = "all";
let selectedAge = "all";
let selectedDuration = "all";

let favouriteFeedbackTimer;

// ========================================
// INITIALISERING
// ========================================

init();

async function init() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error("Kunne ikke hente spil");
    }

    games = await response.json();

    bindEvents();
    render();
  } catch (error) {
    console.error(error);

    if (gameList) {
      gameList.innerHTML = "<p>Kunne ikke indlæse spil.</p>";
    }
  }
}

// ========================================
// EVENTS
// ========================================

function bindEvents() {
  searchInput?.addEventListener("input", render);

  gameList?.addEventListener("click", handleGameListClick);

  filterPanel?.addEventListener("click", handleFilterClick);

  openFiltersButton?.addEventListener("click", openFilterPanel);
  closeFiltersButton?.addEventListener("click", closeFilterPanel);
  showResultsButton?.addEventListener("click", showFilterResults);

  clearFiltersButton?.addEventListener("click", clearAllFilters);

  activeFiltersList?.addEventListener("click", removeActiveFilter);

  closeFavouriteFeedback?.addEventListener("click", hideFavouriteFeedback);

  rulesButton?.addEventListener("click", toggleRules);

  modal?.addEventListener("click", handleModalClick);

  document.addEventListener("keydown", handleKeydown);
}

// ========================================
// FILTERPANEL
// ========================================

function openFilterPanel() {
  if (!filterPanel) return;

  filterPanel.hidden = false;
  openFiltersButton?.setAttribute("aria-expanded", "true");
}

function closeFilterPanel() {
  if (!filterPanel) return;

  filterPanel.hidden = true;
  openFiltersButton?.setAttribute("aria-expanded", "false");
  openFiltersButton?.focus();
}

function showFilterResults() {
  if (!filterPanel) return;

  filterPanel.hidden = true;
  openFiltersButton?.setAttribute("aria-expanded", "false");

  updateActiveFilters();
  render();
}

// ========================================
// FILTERKNAPPER
// ========================================

function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter][data-value]");

  if (!button) return;

  const filter = button.dataset.filter;
  const value = button.dataset.value;

  const filterGroup = button.closest(".filter-options");

  filterGroup?.querySelectorAll(".filter-option").forEach((option) => {
    option.classList.remove("active");
    option.setAttribute("aria-pressed", "false");
  });

  button.classList.add("active");
  button.setAttribute("aria-pressed", "true");

  if (filter === "genre") {
    selectedGenre = value;
  }

  if (filter === "players") {
    selectedPlayers = value;
  }

  if (filter === "age") {
    selectedAge = value;
  }

  if (filter === "duration") {
    selectedDuration = value;
  }

  render();
}

// ========================================
// AKTIVE FILTRE
// ========================================

function updateActiveFilters() {
  if (!activeFilters || !activeFiltersList) return;

  const filters = [];

  if (selectedGenre !== "all") {
    filters.push({
      type: "genre",
      label: selectedGenre,
    });
  }

  if (selectedPlayers !== "all") {
    filters.push({
      type: "players",
      label: `${selectedPlayers} spillere`,
    });
  }

  if (selectedAge !== "all") {
    filters.push({
      type: "age",
      label: `${selectedAge}+ år`,
    });
  }

  if (selectedDuration !== "all") {
    filters.push({
      type: "duration",
      label: getDurationLabel(selectedDuration),
    });
  }

  if (filters.length === 0) {
    activeFilters.hidden = true;
    activeFiltersList.innerHTML = "";
    return;
  }

  activeFilters.hidden = false;

  activeFiltersList.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="active-filter"
          type="button"
          data-remove-filter="${filter.type}"
        >
          <span>${escapeHtml(filter.label)}</span>
          <span aria-hidden="true">×</span>
        </button>
      `,
    )
    .join("");
}

function getDurationLabel(duration) {
  if (duration === "0-30") {
    return "< 30 min";
  }

  if (duration === "30-60") {
    return "30-60 min";
  }

  if (duration === "60-120") {
    return "+60 min";
  }

  return duration;
}

function removeActiveFilter(event) {
  const button = event.target.closest("[data-remove-filter]");

  if (!button) return;

  const filter = button.dataset.removeFilter;

  if (filter === "genre") {
    selectedGenre = "all";
  }

  if (filter === "players") {
    selectedPlayers = "all";
  }

  if (filter === "age") {
    selectedAge = "all";
  }

  if (filter === "duration") {
    selectedDuration = "all";
  }

  resetFilterButton(filter);
  updateActiveFilters();
  render();
}

function resetFilterButton(filter) {
  document
    .querySelectorAll(`.filter-option[data-filter="${filter}"]`)
    .forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
}

// ========================================
// RYD FILTRE
// ========================================

function clearAllFilters() {
  if (searchInput) {
    searchInput.value = "";
  }

  selectedGenre = "all";
  selectedPlayers = "all";
  selectedAge = "all";
  selectedDuration = "all";

  document.querySelectorAll(".filter-option").forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });

  updateActiveFilters();
  render();
}

// ========================================
// FILTRERING
// ========================================

function getFilters() {
  return {
    query: (searchInput?.value || "").trim().toLowerCase(),
    genre: selectedGenre,
    players: selectedPlayers,
    age: selectedAge,
    duration: selectedDuration,
  };
}

function applyFilters(gameData, filters) {
  return gameData.filter((game) => {
    const gameTitle = (game.title || "").toLowerCase();

    if (filters.query && !gameTitle.includes(filters.query)) {
      return false;
    }

    if (filters.genre !== "all" && game.genre !== filters.genre) {
      return false;
    }

    if (filters.age !== "all" && game.age < Number(filters.age)) {
      return false;
    }

    if (
      filters.players !== "all" &&
      !matchesPlayerFilter(game, filters.players)
    ) {
      return false;
    }

    if (
      filters.duration !== "all" &&
      !matchesDurationFilter(game, filters.duration)
    ) {
      return false;
    }

    return true;
  });
}

function matchesPlayerFilter(game, filter) {
  const [minValue, maxValue] = filter.split("-");

  const wantedMin = Number(minValue);
  const wantedMax = Number(maxValue);

  const gameMin = game.players?.min ?? 1;
  const gameMax = game.players?.max ?? Infinity;

  return !(gameMax < wantedMin || gameMin > wantedMax);
}

function matchesDurationFilter(game, filter) {
  const [from, to] = filter.split("-").map(Number);

  return !(game.playtime < from || game.playtime > to);
}

// ========================================
// VIS SPIL
// ========================================

function render() {
  if (!gameList) return;

  const filters = getFilters();
  const filteredGames = applyFilters(games, filters);

  if (!filteredGames.length) {
    gameList.innerHTML = `
      <p class="no-results">
        Ingen spil matcher dine filtre.
      </p>
    `;

    return;
  }

  gameList.innerHTML = filteredGames.map(createGameCard).join("");
}

// ========================================
// SPILKORT
// ========================================

function createGameCard(game, index) {
  const isFavourite = favourites.has(String(game.id));

  const favouriteClass = isFavourite ? "active" : "";

  const favouriteLabel = isFavourite
    ? "Fjern fra favoritter"
    : "Føj til favoritter";

  const players = game.players
    ? `${game.players.min}–${game.players.max}`
    : "—";

  const rating = Number.isFinite(game.rating) ? game.rating.toFixed(1) : "—";

  const availableBadge = game.available
    ? `<span class="badge">Ledig</span>`
    : "";

  return `
    <article
      class="card"
      data-id="${game.id}"
    >
      <div class="thumb">
        <img
          src="${getLocalGameImage(game)}"
          alt="${escapeHtml(game.title)}"
          ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
          decoding="async"
        >

        <div class="badges">
          ${availableBadge}
        </div>

        <button
          class="fav ${favouriteClass}"
          type="button"
          data-fav-id="${game.id}"
          aria-label="${favouriteLabel}"
          aria-pressed="${isFavourite}"
        >
          ❤
        </button>
      </div>

      <h3>${escapeHtml(game.title)}</h3>

      <div class="meta">
        <span>👥 ${players}</span>
        <span>⭐ ${rating}</span>
      </div>

      ${
        game.shelf
          ? `
            <div class="extra">
              <span>
                Placering: ${escapeHtml(game.shelf)}
              </span>
            </div>
          `
          : ""
      }
    </article>
  `;
}

// ========================================
// SPILKORT OG FAVORITTER
// ========================================

function handleGameListClick(event) {
  const favouriteButton = event.target.closest("button.fav[data-fav-id]");

  if (favouriteButton) {
    event.stopPropagation();

    toggleFavourite(favouriteButton.dataset.favId);

    return;
  }

  const card = event.target.closest(".card[data-id]");

  if (card) {
    openModalById(card.dataset.id);
  }
}

function toggleFavourite(id) {
  const gameId = String(id);

  if (favourites.has(gameId)) {
    favourites.delete(gameId);
    showFavouriteFeedback("Fjernet fra favoritter");
  } else {
    favourites.add(gameId);
    showFavouriteFeedback("Tilføjet til favoritter");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favourites]));

  render();
}

// ========================================
// FAVORIT-FEEDBACK
// ========================================

function showFavouriteFeedback(message) {
  if (!favouriteFeedback || !favouriteFeedbackText) return;

  favouriteFeedbackText.textContent = message;
  favouriteFeedback.hidden = false;

  clearTimeout(favouriteFeedbackTimer);

  favouriteFeedbackTimer = setTimeout(() => {
    favouriteFeedback.hidden = true;
  }, 3000);
}

function hideFavouriteFeedback() {
  if (!favouriteFeedback) return;

  favouriteFeedback.hidden = true;
  clearTimeout(favouriteFeedbackTimer);
}

// ========================================
// MODAL – SPILDETALJER
// ========================================

function openModalById(id) {
  const game = games.find((item) => String(item.id) === String(id));

  if (!game || !modal) return;

  if (modalImage) {
    modalImage.src = getLocalGameImage(game);
    modalImage.alt = game.title;
  }

  if (modalTitle) {
    modalTitle.textContent = game.title;
  }

  if (modalMeta) {
    modalMeta.innerHTML = [
      Number.isFinite(game.rating) ? `⭐ ${game.rating.toFixed(1)}` : null,

      game.players ? `👥 ${game.players.min}–${game.players.max}` : null,

      Number.isFinite(game.playtime) ? `⏱️ ${game.playtime} min` : null,

      game.age ? `👶 ${game.age}+` : null,
    ]
      .filter(Boolean)
      .map((item) => `<span>${item}</span>`)
      .join("");
  }

  if (modalDescription) {
    modalDescription.textContent = game.description || "";
  }

  if (modalDetails) {
    modalDetails.innerHTML = [
      game.genre
        ? `<span>
            🎭 Kategori: ${escapeHtml(game.genre)}
          </span>`
        : "",

      game.language
        ? `<span>
            🗣️ Sprog: ${escapeHtml(game.language)}
          </span>`
        : "",

      game.difficulty
        ? `<span>
            🎯 Sværhed: ${escapeHtml(game.difficulty)}
          </span>`
        : "",

      game.shelf
        ? `<span>
            📍 Placering: ${escapeHtml(game.shelf)}
          </span>`
        : "",

      game.available != null
        ? `<span>
            ${game.available ? "✅ Ledig" : "❌ Udlånt"}
          </span>`
        : "",
    ].join("");
  }

  if (modalRules) {
    modalRules.textContent =
      game.rules || "Der er endnu ikke tilføjet regler for dette spil.";
  }

  if (modalRulesWrap) {
    modalRulesWrap.hidden = false;
  }

  rulesContent?.classList.remove("open");
  rulesButton?.setAttribute("aria-expanded", "false");

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;

  modal.hidden = true;
  document.body.style.overflow = "";
}

// ========================================
// REGLER I MODAL
// ========================================

function toggleRules() {
  const isOpen = rulesContent?.classList.toggle("open");

  rulesButton?.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

// ========================================
// LUK MODAL
// ========================================

function handleModalClick(event) {
  if (
    event.target.matches("[data-close]") ||
    event.target.classList.contains("modal-backdrop")
  ) {
    closeModal();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && modal && modal.hidden === false) {
    closeModal();
  }
}

// ========================================
// LOKALE SPILBILLEDER
// ========================================

function getLocalGameImage(game) {
  const fileName = game.title
    .toLowerCase()
    .replaceAll(":", "")
    .replaceAll(" ", "-")
    .replaceAll("æ", "ae")
    .replaceAll("ø", "oe")
    .replaceAll("å", "aa");

  return `images/spil/${fileName}.webp`;
}

// ========================================
// HJÆLPEFUNKTION
// ========================================

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

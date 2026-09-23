// ========================================
// DATA & KONSTANTER
// ========================================

const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

const STORAGE_KEY = "favs";

// ========================================
// DOM-ELEMENTER
// ========================================

const favouritesContent = document.getElementById("favourites-content");
const favouritesEmpty = document.getElementById("favourites-empty");
const favouritesGrid = document.getElementById("favourites-grid");
const favouritesCount = document.getElementById("favourites-count");

// ========================================
// STATE
// ========================================

let GAMES = [];

let FAVS = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

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

    GAMES = await response.json();

    renderFavourites();
  } catch (error) {
    console.error(error);

    if (favouritesGrid) {
      favouritesGrid.innerHTML = "<p>Kunne ikke indlæse dine favoritter.</p>";
    }
  }
}

// ========================================
// VIS FAVORITTER
// ========================================

function renderFavourites() {
  const favouriteGames = GAMES.filter((game) => FAVS.has(String(game.id)));

  // Ingen favoritter
  if (favouriteGames.length === 0) {
    favouritesContent.hidden = true;
    favouritesEmpty.hidden = false;

    return;
  }

  // Der findes favoritter
  favouritesContent.hidden = false;
  favouritesEmpty.hidden = true;

  favouritesCount.textContent =
    favouriteGames.length === 1 ? "1 spil" : `${favouriteGames.length} spil`;

  favouritesGrid.innerHTML = favouriteGames.map(favouriteCard).join("");
}

// ========================================
// FAVORITKORT
// ========================================

function favouriteCard(game) {
  const players = game.players
    ? `${game.players.min}–${game.players.max}`
    : "—";

  const rating = Number.isFinite(game.rating) ? game.rating.toFixed(1) : "—";

  return `
    <article class="favourite-card" data-id="${game.id}">
      <div class="favourite-card__image">
        <img
          src="${game.image}"
          alt="${escapeHtml(game.title)}"
          loading="lazy"
          decoding="async"
        />

        <button
          class="favourite-card__heart active"
          type="button"
          data-remove-favourite="${game.id}"
          aria-label="Fjern ${escapeHtml(game.title)} fra favoritter"
          aria-pressed="true"
        >
          ❤
        </button>
      </div>

      <h2>${escapeHtml(game.title)}</h2>

      <div class="favourite-card__meta">
        <span>👥 ${players}</span>
        <span>⭐ ${rating}</span>
      </div>
    </article>
  `;
}

// ========================================
// FJERN FAVORIT
// ========================================

favouritesGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-favourite]");

  if (!button) return;

  const id = String(button.dataset.removeFavourite);

  FAVS.delete(id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...FAVS]));

  renderFavourites();
});

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

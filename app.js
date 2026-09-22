// ========================================
// DATA & KONSTANTER
// ========================================

const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

const STORAGE_KEY = "favs";

// ========================================
// DOM-ELEMENTER
// ========================================

const els = {
  search: document.getElementById("search-input"),
  list: document.getElementById("game-list"),

  genre: document.getElementById("genre-select"),
  language: document.getElementById("language-select"),
  difficulty: document.getElementById("difficulty-select"),

  ratingFrom: document.getElementById("rating-from"),
  ratingTo: document.getElementById("rating-to"),

  playFrom: document.getElementById("playtime-from"),
  playTo: document.getElementById("playtime-to"),

  availableOnly: document.getElementById("available-only"),
  sort: document.getElementById("sort-select"),

  tabFav: document.getElementById("filter-favourites"),
};

// Modal
const modal = document.getElementById("game-modal");
const mImg = document.getElementById("modal-image");
const mTitle = document.getElementById("modal-title");
const mMeta = document.getElementById("modal-meta");
const mDesc = document.getElementById("modal-desc");
const mDetails = document.getElementById("modal-details");
const mRulesWrap = document.getElementById("modal-rules-wrap");
const mRules = document.getElementById("modal-rules");
const rulesBtn = document.getElementById("rules-toggle");
const rulesContent = document.getElementById("rules-content");

// Nyt filterpanel
const openFiltersButton = document.getElementById("open-filters");
const closeFiltersButton = document.getElementById("close-filters");
const filterPanel = document.getElementById("filter-panel");

// Sortering
const openSortButton = document.getElementById("open-sort");

// ========================================
// STATE
// ========================================

let GAMES = [];

let SHOW_FAVS = false;

let FAVS = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

// De tre filtre gemmes direkte i JavaScript.
// Vi behøver derfor ikke længere oprette skjulte inputs til dem.
let selectedAge = "all";
let selectedPlayers = "all";
let selectedDuration = "all";

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

    hydrateSelects(GAMES);
    bindEvents();
    render();
  } catch (error) {
    console.error(error);

    if (els.list) {
      els.list.innerHTML = "<p>Kunne ikke indlæse spil.</p>";
    }
  }
}

// ========================================
// OPRET FILTERMULIGHEDER
// ========================================

function hydrateSelects(games) {
  fillUniqueOptions(els.genre, unique(games.map((game) => game.genre)));

  fillUniqueOptions(els.language, unique(games.map((game) => game.language)));

  fillUniqueOptions(
    els.difficulty,
    unique(games.map((game) => game.difficulty)),
  );

  updateFavTabCounter();
}

// ========================================
// EVENTS
// ========================================

function bindEvents() {
  // Søgning
  els.search?.addEventListener("input", render);

  // Eksisterende select-filtre
  [
    els.genre,
    els.language,
    els.difficulty,
    els.ratingFrom,
    els.ratingTo,
    els.playFrom,
    els.playTo,
    els.availableOnly,
    els.sort,
  ].forEach((element) => {
    element?.addEventListener("input", render);
  });

  // Klik på spil eller favorit
  els.list?.addEventListener("click", handleGameListClick);

  // Favoritter i navigation
  els.tabFav?.addEventListener("click", () => {
    SHOW_FAVS = true;
    render();
  });

  // Filterknapper inde i filterpanelet
  filterPanel?.addEventListener("click", handleFilterClick);

  // Eventuel ryd filtre-knap
  document
    .getElementById("clear-filters-pill")
    ?.addEventListener("click", clearAllFilters);

  document
    .getElementById("clear-filters")
    ?.addEventListener("click", clearAllFilters);
}

// ========================================
// ÅBN / LUK FILTERPANEL
// ========================================

openFiltersButton?.addEventListener("click", () => {
  filterPanel.hidden = false;

  openFiltersButton.setAttribute("aria-expanded", "true");
});

closeFiltersButton?.addEventListener("click", () => {
  filterPanel.hidden = true;

  openFiltersButton?.setAttribute("aria-expanded", "false");

  openFiltersButton?.focus();
});

// ========================================
// FILTERKNAPPER
// ========================================

function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter][data-value]");

  if (!button) return;

  const filter = button.dataset.filter;
  const value = button.dataset.value;

  if (filter === "genre") {
    setSelectValue(els.genre, value);
  }

  if (filter === "language") {
    setSelectValue(els.language, value);
  }

  if (filter === "difficulty") {
    setSelectValue(els.difficulty, value);
  }

  if (filter === "age") {
    selectedAge = value;
  }

  if (filter === "players") {
    selectedPlayers = value;
  }

  if (filter === "duration") {
    selectedDuration = value;
  }

  render();
}

function setSelectValue(select, value) {
  if (!select) return;

  if (value === "all") {
    select.value = "all";
    return;
  }

  const options = Array.from(select.options);

  const match = options.find(
    (option) => option.value.toLowerCase() === String(value).toLowerCase(),
  );

  select.value = match ? match.value : "all";
}

// ========================================
// HENT AKTIVE FILTRE
// ========================================

function getFilters() {
  const numberOrNull = (value) => {
    if (value === "" || value == null) {
      return null;
    }

    return Number(value);
  };

  return {
    query: (els.search?.value || "").trim().toLowerCase(),

    genre: valueOrAll(els.genre),

    language: valueOrAll(els.language),

    difficulty: valueOrAll(els.difficulty),

    ratingFrom: numberOrNull(els.ratingFrom?.value),

    ratingTo: numberOrNull(els.ratingTo?.value),

    playFrom: numberOrNull(els.playFrom?.value),

    playTo: numberOrNull(els.playTo?.value),

    availableOnly: !!els.availableOnly?.checked,

    sort: valueOrAll(els.sort),

    age: selectedAge,

    players: selectedPlayers,

    duration: selectedDuration,
  };
}

function valueOrAll(element) {
  return element?.value || "all";
}

// ========================================
// FILTRERING
// ========================================

function applyFilters(games, filters) {
  return games.filter((game) => {
    const searchableText = `
      ${game.title || ""}
      ${game.description || ""}
      ${game.rules || ""}
    `.toLowerCase();

    // Søgning
    if (filters.query && !searchableText.includes(filters.query)) {
      return false;
    }

    // Kategori
    if (filters.genre !== "all" && game.genre !== filters.genre) {
      return false;
    }

    // Sprog
    if (filters.language !== "all" && game.language !== filters.language) {
      return false;
    }

    // Sværhedsgrad
    if (
      filters.difficulty !== "all" &&
      game.difficulty !== filters.difficulty
    ) {
      return false;
    }

    // Rating
    if (filters.ratingFrom !== null && game.rating < filters.ratingFrom) {
      return false;
    }

    if (filters.ratingTo !== null && game.rating > filters.ratingTo) {
      return false;
    }

    // Spilletid
    if (filters.playFrom !== null && game.playtime < filters.playFrom) {
      return false;
    }

    if (filters.playTo !== null && game.playtime > filters.playTo) {
      return false;
    }

    // Kun ledige
    if (filters.availableOnly && !game.available) {
      return false;
    }

    // Alder
    if (filters.age !== "all" && game.age < Number(filters.age)) {
      return false;
    }

    // Antal spillere
    if (filters.players !== "all") {
      const [minValue, maxValue] = filters.players.split("-");

      const wantedMin = Number(minValue.replace("+", ""));

      const wantedMax = filters.players.includes("+")
        ? Infinity
        : Number(maxValue);

      const gameMin = game.players?.min ?? 1;

      const gameMax = game.players?.max ?? Infinity;

      if (gameMax < wantedMin || gameMin > wantedMax) {
        return false;
      }
    }

    // Varighed
    if (filters.duration !== "all") {
      if (filters.duration.includes("+")) {
        const minimum = Number(filters.duration.replace("+", ""));

        if (game.playtime < minimum) {
          return false;
        }
      } else {
        const [from, to] = filters.duration.split("-").map(Number);

        if (game.playtime < from || game.playtime > to) {
          return false;
        }
      }
    }

    // Favoritter
    if (SHOW_FAVS && !FAVS.has(String(game.id))) {
      return false;
    }

    return true;
  });
}

// ========================================
// SORTERING
// ========================================

function applySort(games, sort) {
  const sortedGames = [...games];

  switch (sort) {
    case "title":
      sortedGames.sort((a, b) => a.title.localeCompare(b.title, "da"));
      break;

    case "playtime":
      sortedGames.sort((a, b) => (a.playtime ?? 0) - (b.playtime ?? 0));
      break;

    case "rating":
      sortedGames.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
  }

  return sortedGames;
}

// ========================================
// VIS SPIL
// ========================================

function render() {
  if (!els.list) return;

  const filters = getFilters();

  const filteredGames = applyFilters(GAMES, filters);

  const sortedGames = applySort(filteredGames, filters.sort);

  if (!sortedGames.length) {
    els.list.innerHTML = `
      <p class="no-results">
        Ingen spil matcher dine filtre.
      </p>
    `;

    return;
  }

  els.list.innerHTML = sortedGames.map(gameCard).join("");

  updateFavTabCounter();
}

// ========================================
// SPILKORT
// ========================================

function gameCard(game) {
  const isFavourite = FAVS.has(String(game.id));

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
          src="${game.image}"
          alt="${escapeHtml(game.title)}"
          loading="lazy"
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

      <h3>
        ${escapeHtml(game.title)}
      </h3>

      <div class="meta">
        <span>
          👥 ${players}
        </span>

        <span>
          ⭐ ${rating}
        </span>
      </div>

      <div class="extra">
        ${
          game.shelf
            ? `<span>
                Placering:
                ${escapeHtml(game.shelf)}
               </span>`
            : ""
        }
      </div>
    </article>
  `;
}

// ========================================
// KLIK PÅ SPIL / FAVORITTER
// ========================================

function handleGameListClick(event) {
  const favouriteButton = event.target.closest("button.fav[data-fav-id]");

  if (favouriteButton) {
    event.stopPropagation();

    const id = String(favouriteButton.dataset.favId);

    if (FAVS.has(id)) {
      FAVS.delete(id);
    } else {
      FAVS.add(id);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...FAVS]));

    render();

    return;
  }

  const card = event.target.closest(".card[data-id]");

  if (card) {
    openModalById(card.dataset.id);
  }
}

// ========================================
// FAVORITTER
// ========================================

function updateFavTabCounter() {
  const counter = els.tabFav?.querySelector("small");

  if (counter) {
    counter.textContent = `Favoritter (${FAVS.size})`;
  }
}

// ========================================
// RYD FILTRE
// ========================================

function clearAllFilters() {
  if (els.search) {
    els.search.value = "";
  }

  if (els.genre) {
    els.genre.value = "all";
  }

  if (els.language) {
    els.language.value = "all";
  }

  if (els.difficulty) {
    els.difficulty.value = "all";
  }

  if (els.ratingFrom) {
    els.ratingFrom.value = "";
  }

  if (els.ratingTo) {
    els.ratingTo.value = "";
  }

  if (els.playFrom) {
    els.playFrom.value = "";
  }

  if (els.playTo) {
    els.playTo.value = "";
  }

  if (els.availableOnly) {
    els.availableOnly.checked = false;
  }

  if (els.sort) {
    els.sort.value = "none";
  }

  selectedAge = "all";
  selectedPlayers = "all";
  selectedDuration = "all";

  SHOW_FAVS = false;

  render();
}

// ========================================
// MODAL – SPILDETALJER
// ========================================

function openModalById(id) {
  const game = GAMES.find((item) => String(item.id) === String(id));

  if (!game || !modal) return;

  if (mImg) {
    mImg.src = game.image;
    mImg.alt = game.title;
  }

  if (mTitle) {
    mTitle.textContent = game.title;
  }

  if (mMeta) {
    mMeta.innerHTML = [
      Number.isFinite(game.rating) ? `⭐ ${game.rating.toFixed(1)}` : null,

      game.players ? `👥 ${game.players.min}–${game.players.max}` : null,

      Number.isFinite(game.playtime) ? `⏱️ ${game.playtime} min` : null,

      game.age ? `👶 ${game.age}+` : null,
    ]
      .filter(Boolean)
      .map((item) => `<span>${item}</span>`)
      .join("");
  }

  if (mDesc) {
    mDesc.textContent = game.description || "";
  }

  if (mDetails) {
    mDetails.innerHTML = [
      game.genre
        ? `<span>
            🎭 Kategori:
            ${escapeHtml(game.genre)}
           </span>`
        : "",

      game.language
        ? `<span>
            🗣️ Sprog:
            ${escapeHtml(game.language)}
           </span>`
        : "",

      game.difficulty
        ? `<span>
            🎯 Sværhed:
            ${escapeHtml(game.difficulty)}
           </span>`
        : "",

      game.shelf
        ? `<span>
            📍 Placering:
            ${escapeHtml(game.shelf)}
           </span>`
        : "",

      game.available != null
        ? `<span>
            ${game.available ? "✅ Ledig" : "❌ Udlånt"}
           </span>`
        : "",
    ].join("");
  }

  if (mRules) {
    mRules.textContent =
      game.rules || "Der er endnu ikke tilføjet regler for dette spil.";
  }

  if (mRulesWrap) {
    mRulesWrap.hidden = false;
  }

  rulesContent?.classList.remove("open");

  rulesBtn?.setAttribute("aria-expanded", "false");

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

rulesBtn?.addEventListener("click", () => {
  const isOpen = rulesContent?.classList.toggle("open");

  rulesBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Luk modal ved klik på backdrop
modal?.addEventListener("click", (event) => {
  if (
    event.target.matches("[data-close]") ||
    event.target.classList.contains("modal-backdrop")
  ) {
    closeModal();
  }
});

// Luk modal med Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.hidden === false) {
    closeModal();
  }
});

// ========================================
// SORTERING
// ========================================

openSortButton?.addEventListener("click", () => {
  /*
      Vi kobler den nye
      sorteringsløsning på her,
      når designet er klar.
    */
});

// ========================================
// HJÆLPEFUNKTIONER
// ========================================

function fillUniqueOptions(select, values) {
  if (!select) return;

  unique(values).forEach((value) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  });
}

function unique(array) {
  return [...new Set(array.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "da"),
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

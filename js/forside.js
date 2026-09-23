const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

const STORAGE_KEY = "favs";

const popularGamesContainer = document.querySelector("#popular-games");

async function loadPopularGames() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error("Kunne ikke hente spillene");
    }

    const games = await response.json();

    // Sortér efter rating og vis kun de 3 højest ratede spil
    const popularGames = games.sort((a, b) => b.rating - a.rating).slice(0, 3);

    renderPopularGames(popularGames);
  } catch (error) {
    console.error("Kunne ikke hente spillene:", error);

    if (popularGamesContainer) {
      popularGamesContainer.innerHTML = "<p>Spillene kunne ikke indlæses.</p>";
    }
  }
}

function renderPopularGames(games) {
  const favourites = getFavourites();

  popularGamesContainer.innerHTML = games
    .map((game) => {
      const isFavourite = favourites.has(String(game.id));

      return `
        <article class="popular-card">
          <div class="popular-card__image-wrap">
            <img
              src="${getLocalGameImage(game)}"
              alt="${escapeHtml(game.title)}"
              class="popular-card__image"
              loading="lazy"
              decoding="async"
            />

            <button
              class="popular-card__favorite ${isFavourite ? "active" : ""}"
              type="button"
              data-id="${game.id}"
              aria-label="${
                isFavourite
                  ? `Fjern ${escapeHtml(game.title)} fra favoritter`
                  : `Tilføj ${escapeHtml(game.title)} til favoritter`
              }"
              aria-pressed="${isFavourite}"
            >
              ❤
            </button>
          </div>

          <h3>${escapeHtml(game.title)}</h3>

          <div class="popular-card__info">
            <span>⭐ ${game.rating}</span>
            <span>♙ ${game.players.min}-${game.players.max}</span>
          </div>
        </article>
      `;
    })
    .join("");

  bindFavouriteButtons();
}

function bindFavouriteButtons() {
  const buttons = document.querySelectorAll(".popular-card__favorite");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = String(button.dataset.id);
      const favourites = getFavourites();

      if (favourites.has(id)) {
        favourites.delete(id);
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
        button.setAttribute(
          "aria-label",
          button.getAttribute("aria-label").replace("Fjern", "Tilføj"),
        );
      } else {
        favourites.add(id);
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        button.setAttribute(
          "aria-label",
          button.getAttribute("aria-label").replace("Tilføj", "Fjern"),
        );
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favourites]));
    });
  });
}

function getFavourites() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(String),
    );
  } catch {
    return new Set();
  }
}

function getLocalGameImage(game) {
  const imageFiles = {
    Skak: "skak.webp",
    Catan: "catan.webp",
    "Ticket to Ride: Europe": "ticket-to-ride:-europe.webp",
  };

  return `images/spil/${imageFiles[game.title]}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

loadPopularGames();

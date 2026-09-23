const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

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

    popularGamesContainer.innerHTML = popularGames
      .map(
        (game) => `
          <article class="popular-card">
            <div class="popular-card__image-wrapper">
              <img
                src="${getLocalGameImage(game)}"
                alt="${escapeHtml(game.title)}"
                class="popular-card__image"
                loading="lazy"
                decoding="async"
              />

              <button
                class="popular-card__favorite"
                type="button"
                aria-label="Tilføj ${escapeHtml(game.title)} til favoritter"
              >
                ♡
              </button>
            </div>

            <h3>${escapeHtml(game.title)}</h3>

            <div class="popular-card__info">
              <span>⭐ ${game.rating}</span>
              <span>♙ ${game.players.min}-${game.players.max}</span>
            </div>
          </article>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Kunne ikke hente spillene:", error);

    if (popularGamesContainer) {
      popularGamesContainer.innerHTML = "<p>Spillene kunne ikke indlæses.</p>";
    }
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

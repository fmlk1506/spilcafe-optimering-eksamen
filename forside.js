const DATA_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";

const popularGamesContainer = document.querySelector("#popular-games");

async function loadPopularGames() {
  try {
    const response = await fetch(DATA_URL);
    const games = await response.json();
    console.log(games);

    // Sortér efter rating og vis kun de 3 højest ratede spil
    const popularGames = games.sort((a, b) => b.rating - a.rating).slice(0, 3);

    popularGamesContainer.innerHTML = popularGames
      .map(
        (game) => `
          <article class="popular-card">
            <div class="popular-card__image-wrapper">
              <img
                src="${game.image}"
                alt="${game.title}"
                class="popular-card__image"
                loading="lazy"
              />

              <button
                class="popular-card__favorite"
                type="button"
                aria-label="Tilføj ${game.title} til favoritter"
              >
                ♡
              </button>
            </div>

            <h3>${game.title}</h3>

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

    popularGamesContainer.innerHTML = "<p>Spillene kunne ikke indlæses.</p>";
  }
}

loadPopularGames();

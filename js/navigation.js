const navigation = document.getElementById("navigation");

if (navigation) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const params = new URLSearchParams(window.location.search);
  const view = params.get("vis");

  const activePage =
    currentPage === "favoritter.html"
      ? "favoritter"
      : currentPage === "spil.html" && view === "reservation"
        ? "reservation"
        : currentPage === "spil.html"
          ? "spil"
          : "forside";

  const navItems = [
    {
      id: "forside",
      href: "index.html",
      label: "Forside",
      icon: "nav-forside.svg",
      activeIcon: "nav-forside-fyldt.svg",
    },
    {
      id: "spil",
      href: "spil.html",
      label: "Spil",
      icon: "nav-spil.svg",
      activeIcon: "nav-spil-fyldt.svg",
    },
    {
      id: "favoritter",
      href: "favoritter.html",
      label: "Favoritter",
      icon: "nav-favorit.svg",
      activeIcon: "nav-favorit-fyldt.svg",
    },
    {
      id: "reservation",
      href: "spil.html?vis=reservation",
      label: "Bordreservation",
      icon: "nav-reservation.svg",
      activeIcon: "nav-reservation-fyldt.svg",
    },
  ];

  navigation.innerHTML = `
    <nav class="bottom-nav" aria-label="Hovednavigation">
      ${navItems
        .map((item) => {
          const isActive = activePage === item.id;

          return `
            <a
              href="${item.href}"
              class="bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}"
              ${isActive ? 'aria-current="page"' : ""}
            >
              <img
                src="images/${isActive ? item.activeIcon : item.icon}"
                alt=""
                aria-hidden="true"
              />
              <span>${item.label}</span>
            </a>
          `;
        })
        .join("")}
    </nav>
  `;
}

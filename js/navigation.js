const navigation = document.querySelector("#navigation");

if (navigation) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const params = new URLSearchParams(window.location.search);
  const view = params.get("vis");

  let activePage = "forside";

  if (currentPage === "favoritter.html") {
    activePage = "favoritter";
  } else if (currentPage === "spil.html") {
    if (view === "reservation") {
      activePage = "reservation";
    } else {
      activePage = "spil";
    }
  }

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
          const active = activePage === item.id;

          return `
            <a
              href="${item.href}"
              class="bottom-nav__item ${active ? "bottom-nav__item--active" : ""}"
              ${active ? 'aria-current="page"' : ""}
            >
              <img
                src="images/${active ? item.activeIcon : item.icon}"
                alt=""
              />
              <span>${item.label}</span>
            </a>
          `;
        })
        .join("")}
    </nav>
  `;
}

const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".card");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const carouselContainer = document.querySelector(".carousel-container");
const totalCards = cards.length;
let radius = 180; // Default radius
let currentAngle = 0;
let autoRotateInterval = null;
const autoRotateDelay = 800;

function positionCards(animate = false) {
  cards.forEach((card, index) => {
    var angle = (index / totalCards) * 360 + currentAngle;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const z = radius * Math.sin((angle * Math.PI) / 180);
    if (animate) {
      gsap.to(card, {
        x: x,
        z: z,
        rotationY: -angle,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "power2.inOut"
      });
    } else {
      gsap.set(card, {
        x: x,
        z: z,
        rotationY: -angle,
        transformOrigin: "center center"
      });
    }
  });
}

cards.forEach((card, index) => {
  gsap.from(card, {
    opacity: 0,
    scale: 0.5,
    y: 100,
    rotationX: 45,
    delay: index * 0.1,
    duration: 1,
    ease: "power3.out"
  });
});

setTimeout(() => positionCards(false), 1500);

function updateCarousel(direction) {
  if (direction === "next") {
    currentAngle -= 360 / totalCards;
  } else if (direction === "prev") {
    currentAngle += 360 / totalCards;
  }
  positionCards(true);
}

function pauseAutoRotation(temp = false) {
  clearInterval(autoRotateInterval);
  if (temp) {
    setTimeout(startAutoRotation, 3000);
  }
}

function startAutoRotation() {
  clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(() => {
    updateCarousel("next");
  }, autoRotateDelay);
}

// Navigation
nextBtn.addEventListener("click", () => {
  pauseAutoRotation(true);
  updateCarousel("next");
});

prevBtn.addEventListener("click", () => {
  pauseAutoRotation(true);
  updateCarousel("prev");
});

// Hover animation for cards
cards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    gsap.to(card, {
      scale: 1.1,
      z: "+=50",
      duration: 0.3,
      ease: "power2.out"
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      scale: 1,
      z: "-=50",
      duration: 0.3,
      ease: "power2.out"
    });
  });
});

// Responsive radius adjustment
function adjustRadius() {
  const newRadius = window.innerWidth <= 768 ? 300 : 400;
  if (newRadius !== radius) {
    radius = newRadius;
    positionCards(true);
  }
}

window.addEventListener("resize", adjustRadius);

startAutoRotation();



// Fade-in animation for sections
const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
});
sections.forEach(section => observer.observe(section));

// Live markdown preview
const textarea = document.querySelector("textarea");
const output = document.querySelector(".markdown-box");

textarea.addEventListener("input", () => {
  output.innerHTML = marked.parse(textarea.value);
});

// Smooth scrolling for navigation links
const navLinks = document.querySelectorAll("nav a");  
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

// Sidebar item activation on click and deactivation on double-click
document.querySelectorAll(".sidebar ul li").forEach(item => {
  item.addEventListener("click", () => {
    item.classList.add("active");
  });

  item.addEventListener("dblclick", () => {
    item.classList.remove("active");
  });
});


// Ensure only one sidebar item is active at a time
document.querySelectorAll(".sidebar ul li").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
    item.classList.add("active");
  });

  item.addEventListener("dblclick", () => {
    item.classList.remove("active");
  });
});



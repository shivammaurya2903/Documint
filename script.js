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
const textarea = document.getElementById("readmeEditor");
const output = document.getElementById("readmePreview");

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


// 

function parseRepoURL(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}


async function fetchRepoData(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error("Repo not found");
  return await res.json();
}

function generateReadme(data) {
  return `# ${data.name}

${data.description || "No description provided."}

## Features
- ⭐ Stars: ${data.stargazers_count}
- 🍴 Forks: ${data.forks_count}
- 🛠 Language: ${data.language || "N/A"}
- 📦 Topics: ${data.topics.join(", ") || "None"}

## Installation
\`\`\`bash
git clone ${data.html_url}
\`\`\`

## Usage
Describe how to use the project here.

## License
${data.license?.name || "No license specified."}

## Author
[${data.owner.login}](${data.owner.html_url})
`;
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  const input = document.getElementById("repoUrl").value;
  const info = parseRepoURL(input);
  if (!info) return alert("Invalid GitHub link");

  try {
    const data = await fetchRepoData(info.owner, info.repo);
    const readme = generateReadme(data);
    document.getElementById("readmeEditor").value = readme;
    document.getElementById("readmePreview").innerHTML = marked.parse(readme);
  } catch (err) {
    alert("Could not fetch repo data");
  }
});

document.getElementById("generateBtnFab").addEventListener("click", async () => {
  const input = document.getElementById("repoUrl").value;
  const info = parseRepoURL(input);
  if (!info) return alert("Invalid GitHub link");

  try {
    const data = await fetchRepoData(info.owner, info.repo);
    const readme = generateReadme(data);
    document.getElementById("readmeEditor").value = readme;
    document.getElementById("readmePreview").innerHTML = marked.parse(readme);
  } catch (err) {
    alert("Could not fetch repo data");
  }
});

document.getElementById("readmeEditor").addEventListener("input", e => {
  document.getElementById("readmePreview").innerHTML = marked.parse(e.target.value);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const content = document.getElementById("readmeEditor").value;
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "README.md";
  a.click();
  URL.revokeObjectURL(url);
});
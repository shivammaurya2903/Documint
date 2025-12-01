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




// Section templates
const sectionTemplates = {
  "Title & Description": `# Project Title\n\nBrief description of the project.\n\n## Table of Contents\n\n- [Features](#features)\n- [Installation](#installation)\n- [Usage](#usage)\n- [Contributing](#contributing)\n- [License](#license)\n`,
  "Features": `## Features\n\n- Feature 1: Description\n- Feature 2: Description\n- Feature 3: Description\n\n`,
  "Installation": `## Installation\n\n### Prerequisites\n\n- Requirement 1\n- Requirement 2\n\n### Steps\n\n\`\`\`bash\n# Clone the repository\ngit clone https://github.com/username/repo.git\n\n# Navigate to the directory\ncd repo\n\n# Install dependencies\nnpm install\n\`\`\`\n\n`,
  "Usage": `## Usage\n\n\`\`\`javascript\n// Example code\nconst example = new Example();\nexample.run();\n\`\`\`\n\n`,
  "Contributing": `## Contributing\n\n1. Fork the repository\n2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)\n3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n5. Open a Pull Request\n\n`,
  "Acknowledgements": `## Acknowledgements\n\n- Thanks to [Contributor](https://github.com/contributor)\n- Inspired by [Project](https://github.com/project)\n\n`,
  "License": `## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`,
  "Demo": `## Demo\n\nCheck out the live demo [here](https://demo-link.com).\n\n![Demo Screenshot](demo-screenshot.png)\n\n`,
  "Documentation": `## Documentation\n\nFull documentation is available at [docs](https://docs-link.com).\n\n`,
  "Authors": `## Authors\n\n- **Author Name** - *Role* - [GitHub](https://github.com/author)\n\n`,
  "Appendix": `## Appendix\n\nAdditional information or references.\n\n`,
  "Reference": `## Reference\n\n- [Reference 1](link)\n- [Reference 2](link)\n\n`
};

// Ensure only one sidebar item is active at a time
document.querySelectorAll(".sidebar ul li").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
    item.classList.add("active");

    const sectionText = item.textContent.trim();
    const readmeEditor = document.getElementById("readmeEditor");
    if (sectionTemplates[sectionText]) {
      readmeEditor.value += sectionTemplates[sectionText];
      const readmePreview = document.getElementById("readmePreview");
      readmePreview.innerHTML = marked.parse(readmeEditor.value);
    } else if (sectionText === "+ Custom Section") {
      const customName = prompt("Enter custom section name:");
      if (customName) {
        const template = `## ${customName}\n\nAdd content here.\n\n`;
        readmeEditor.value += template;
        const readmePreview = document.getElementById("readmePreview");
        readmePreview.innerHTML = marked.parse(readmeEditor.value);
      }
    }
  });

  item.addEventListener("dblclick", () => {
    item.classList.remove("active");
  });
});


// Parse GitHub Repo Link
function parseRepoURL(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    console.log("🔗 GitHub link parsed:", parts);
    return { owner: parts[0], repo: parts[1] };
  } catch {
    console.warn("⚠️ Invalid GitHub URL format");
    return null;
  }
}

// Fetch Repo Metadata
async function fetchRepoData(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Repository not found. Please check the URL.");
    if (res.status === 403) throw new Error("Access forbidden. The repository might be private or you are rate limited.");
    if (res.status === 422) throw new Error("Invalid repository URL.");
    throw new Error(`Failed to fetch repo data: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log("Repo metadata fetched successfully");
  return data;
}

// Fetch Repo File List
async function fetchRepoFiles(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
  if (!res.ok) {
    if (res.status === 404) return []; // No contents or not found
    if (res.status === 403) throw new Error("Access forbidden for file list.");
    throw new Error(`Failed to fetch file list: ${res.status} ${res.statusText}`);
  }
  const files = await res.json();
  console.log("Repo file list loaded:", files.map(f => f.name));
  return files.map(f => f.name);
}

function generateReadme(data, files) {
  // Detect Graphics
  const bannerFile = files.find(f =>
    /banner\.(png|jpg|jpeg|gif|svg)$/i.test(f)
  );

  const gifBannerFile = files.find(f =>
    /banner\.gif$/i.test(f)
  );

  const logoFile = files.find(f =>
    /logo\.(png|jpg|jpeg|gif|svg)$/i.test(f)
  );

  // AI Logo fallback
  const aiLogoURL =
    "https://api.dicebear.com/7.x/shapes/svg?seed=" + encodeURIComponent(data.name);

  const bannerPath = bannerFile ? `./${bannerFile}` : null;
  const gifBannerPath = gifBannerFile ? `./${gifBannerFile}` : null;
  const logoPath = logoFile ? `./${logoFile}` : aiLogoURL;

  // DEFAULT DESCRIPTION
  const defaultDescription = `
A modern and scalable project designed with clean architecture, high performance, 
and developer experience in mind. Built to be maintainable, flexible, and production-ready.
`.trim();

  // Tagline Generator
  function generateTagline(name) {
    const keywords = [
      "Fast", "Next-Gen", "Scalable", "Modern", "Open-Source",
      "High-Performance", "Smart", "Elegant", "Future-Ready"
    ];
    const tech = ["Framework", "Platform", "Toolkit", "Engine", "System"];
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(keywords)} ${pick(tech)} for ${name}`;
  }

  const tagline = generateTagline(data.name);

  // AI Summary Generator
  function generateAISummary(files) {
    let summary = "This repository contains";

    if (files.includes("src")) summary += " a structured source folder";
    if (files.includes("test")) summary += ", automated tests";
    if (files.includes("docs")) summary += ", documentation";
    if (files.includes("public")) summary += ", public static assets";
    if (files.includes("Dockerfile")) summary += ", Docker configuration";
    if (files.includes("package.json")) summary += ", Node.js environment";
    if (files.includes("requirements.txt")) summary += ", Python dependencies";

    summary += ".\n\nOrganized with development best practices ensuring scalability, modularity, and ease of customization.";

    return summary;
  }

  const aiSummary = generateAISummary(files);

  // Language Badges
  const langIcons = [];
  if (files.some(f => f.endsWith(".js"))) langIcons.push("![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)");
  if (files.some(f => f.endsWith(".ts"))) langIcons.push("![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)");
  if (files.some(f => f.endsWith(".py"))) langIcons.push("![Python](https://img.shields.io/badge/Python-3670A0?logo=python&logoColor=white)");
  if (files.some(f => f.endsWith(".go"))) langIcons.push("![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white)");
  if (files.some(f => f.endsWith(".rs"))) langIcons.push("![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)");
  if (files.some(f => f.endsWith(".cpp"))) langIcons.push("![C++](https://img.shields.io/badge/C++-00599C?logo=cplusplus&logoColor=white)");
  if (files.some(f => f.endsWith(".java"))) langIcons.push("![Java](https://img.shields.io/badge/Java-007396?logo=java&logoColor=white)");
  if (files.some(f => f.endsWith(".html"))) langIcons.push("![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)");
  if (files.some(f => f.endsWith(".css"))) langIcons.push("![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)");

  // Release Notes
  function generateReleaseNotes(files) {
    const notes = [];
    if (files.includes("src")) notes.push("- Initial codebase structure added");
    if (files.includes("test")) notes.push("- Test suite implemented");
    if (files.includes("docs")) notes.push("- Documentation initialized");
    if (files.includes("Dockerfile")) notes.push("- Docker support added");
    if (files.includes("public")) notes.push("- Frontend assets added");
    if (files.includes("package.json")) notes.push("- Node.js environment setup");
    if (files.includes("requirements.txt")) notes.push("- Python environment setup");

    return notes.length
      ? notes.map(n => `✨ ${n}`).join("\n")
      : "No releases yet.";
  }

  const releaseNotes = generateReleaseNotes(files);

  // Generate hierarchical folder tree
  function generateFolderTree(files) {
    const tree = {};

    files.forEach(path => {
      const parts = path.split("/");
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = (index === parts.length - 1) ? null : {};
        }
        current = current[part];
      });
    });

    function renderTree(node, prefix = "") {
      return Object.entries(node)
        .map(([name, value], index, arr) => {
          const isLast = index === arr.length - 1;
          const branch = isLast ? "└── " : "├── ";
          const nextPrefix = prefix + (isLast ? "    " : "│   ");

          if (value === null) {
            return `${prefix}${branch}📄 ${name}`;
          } else {
            return `${prefix}${branch}📁 ${name}\n` + renderTree(value, nextPrefix);
          }
        })
        .join("\n");
    }

    return `📦 ${data.name}\n${renderTree(tree)}`;
  }

  // Social Icons
  const socialIcons = `
<p align="center">
<a href="https://github.com/${data.owner.login}">
<img src="https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github" />
</a>
<a href="https://linkedin.com/in/${data.owner.login}">
<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin" />
</a>
<a href="https://twitter.com/${data.owner.login}">
<img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter" />
</a>
<a href="https://${data.owner.login}.vercel.app">
<img src="https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome" />
</a>
</p>
`;

  // Contributors Grid
  const contributorsGrid = `
<p align="center">
<img src="https://contrib.rocks/image?repo=${data.owner.login}/${data.name}" />
</p>
`;

  const projectDescription = data.description || defaultDescription;

  return `
<!-- Dynamic GIF Banner -->
${gifBannerPath
    ? `<p align="center"><img src="${gifBannerPath}" width="100%" /></p>`
    : bannerPath
    ? `<p align="center"><img src="${bannerPath}" width="100%" /></p>`
    : `<p align="center"><img src="https://raw.githubusercontent.com/roshanlam/animated-banners/main/banners/gradient.gif" width="100%" /></p>`}

<!-- Logo -->
<p align="center">
  <img src="${logoPath}" alt="Project Logo" width="150" />
</p>

<h1 align="center">🚀 ${data.name}</h1>
<h3 align="center"><i>${tagline}</i></h3>

<p align="center"><i>${projectDescription}</i></p>

<p align="center">${langIcons.join(" ")}</p>

${socialIcons}

---

# 📘 AI Summary  
${aiSummary}

---

# 🎯 Features  
✔ AI-powered documentation  
✔ Dynamic banners  
✔ Auto-detected badges  
✔ Contributors grid  
✔ Professional visuals  
✔ Modern UX-focused README  
${files.includes("Dockerfile") ? "✔ Docker support\n" : ""}

---

# 📝 Release Notes  
${releaseNotes}

---

# 📁 Project Structure  
\`\`\`plaintext
${generateFolderTree(files)}
\`\`\`


---

# 👥 Contributors  
${contributorsGrid}

---

# 🤝 Contributions  
We welcome all contributions. Fork → Improve → PR.

---

# 📄 License  
**${data.license?.name || "No license provided"}**

---

# 👤 Author  
**[${data.owner.login}](${data.owner.html_url})**

---

# ⭐ Support This Project  
If this project helped you, drop a **star ⭐** — it's the best way to support the project!

---

# 🌐 Join the Community  
- 🗣️ Join discussions  
- 🐛 Report bugs  
- 💡 Suggest features  
- 🚀 Contribute code  

---

# 🙏 Thank You  
Thanks for checking out this project!  
Made with ❤️ for developers.

<p align="center">
  <img src="https://img.shields.io/badge/Open%20Source-Forever-blue?style=for-the-badge" />
</p>

`;
}




  // DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    const repoInput = document.getElementById("repoInput");
    const generateBtn = document.getElementById("generateBtn");
    const generateBtnFab = document.getElementById("generateBtnFab");
    const readmeEditor = document.getElementById("readmeEditor");
    const readmePreview = document.getElementById("readmePreview");
    const downloadBtn = document.getElementById("downloadBtn");
    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");

    // Function to toggle visibility of clear and copy buttons based on editor content
    function toggleButtons() {
      const hasText = readmeEditor.value.trim() !== '';
      clearBtn.style.display = hasText ? 'inline-block' : 'none';
      copyBtn.style.display = hasText ? 'inline-block' : 'none';
    }

    // Initially hide buttons
    toggleButtons();

    // 🛠 Generate README
    const generateReadmeHandler = async () => {
    const repoInput = document.getElementById("repoInput");
    if (!repoInput) {
      console.error("repoInput not found in DOM.");
      alert("README generation failed: input field missing.");
      return;
    }
    const input = repoInput.value.trim();
    const info = parseRepoURL(input);
     
      if (!info) {
        alert(" Invalid GitHub link. Please check and try again.");
        return;
      }

      try {
        console.log("Fetching repo data...");
        const data = await fetchRepoData(info.owner, info.repo);
        const files = await fetchRepoFiles(info.owner, info.repo);
        const readme = generateReadme(data, files);

        readmeEditor.value = readme;
        readmePreview.innerHTML = marked.parse(readme);
        toggleButtons();
        console.log(" README generated and previewed!");
      } catch (err) {
        alert(err.message);
        console.error("Error:", err.message);
      }
    };

    generateBtn.addEventListener("click", generateReadmeHandler);
    generateBtnFab.addEventListener("click", generateReadmeHandler);

    // Live Markdown Preview
    readmeEditor.addEventListener("input", () => {
      readmePreview.innerHTML = marked.parse(readmeEditor.value);
      toggleButtons();
      console.log("Preview updated");
    });

    // Download README.md
    downloadBtn.addEventListener("click", () => {
      const content = readmeEditor.value;
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "README.md";
      a.click();
      URL.revokeObjectURL(url);
      console.log("README.md downloaded successfully ");
    });

    // Clear README Editor
    clearBtn.addEventListener("click", () => {
      readmeEditor.value = "";
      readmePreview.innerHTML = "";
      toggleButtons();
      console.log("README editor cleared");
    });

    // Copy README Editor content to clipboard
    copyBtn.addEventListener("click", () => {
      const content = readmeEditor.value;
      if (!content) {
        alert("Nothing to copy!");
        return;
      }
      navigator.clipboard.writeText(content).then(() => {
        console.log("README content copied to clipboard");
        alert("README content copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy:", err);
        alert("Failed to copy content. Please try manually.");
      });
    });

  });
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
  return `#  ${data.name}

> **${data.description || "No description provided."}**

---

## 🌟 **Project Overview**

Welcome to the amazing **${data.name}** project! This repository is dedicated to providing top-notch solutions and innovative features to make your development journey smoother and more enjoyable. Dive in and explore the powerful capabilities packed inside! 🎉✨

---

## ✨ **Key Features**

${files.includes("src") ? "🔧 Modular and well-structured source code for easy maintenance and scalability.\n" : ""}
${files.includes("docs") ? "📚 Comprehensive built-in documentation to help you get started quickly.\n" : ""}
${files.includes("test") ? "🧪 Thorough unit tests included to ensure reliability and robustness.\n" : ""}
${files.includes("package.json") ? "📦 Node.js dependencies managed efficiently for seamless setup.\n" : ""}
${files.includes("requirements.txt") ? "🐍 Python dependencies clearly listed for quick environment setup.\n" : ""}
${files.includes("public") ? "🌐 Static assets organized for optimal performance and delivery.\n" : ""}
${files.includes("README.md") ? "📖 Existing README detected, enhanced for better clarity and usability.\n" : ""}

---

## 🚀 **Getting Started**

Follow these simple steps to get your development environment up and running in no time! 🛠️💻

\`\`\`bash
git clone ${data.html_url}
cd ${data.name}
${files.includes("package.json") ? "npm install" : ""}
${files.includes("requirements.txt") ? "pip install -r requirements.txt" : ""}
\`\`\`

---

## 🏃‍♂️ **Usage Instructions**

Start the application and explore its features with ease. 🚦

\`\`\`bash
${files.includes("package.json") ? "npm start" : "python main.py"}
\`\`\`

---

## 🤝 **Contributing**

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help is appreciated. Please read our contribution guidelines and submit a Pull Request. 📝💡

---

## ❓ **Frequently Asked Questions (FAQ)**

**Q:** How do I report issues?  
**A:** Please use the GitHub Issues tab to report bugs or request features.

**Q:** Is there a roadmap?  
**A:** Check the project Wiki or Discussions for upcoming plans and milestones.

---

## 📄 **License**

${data.license?.name || "No license specified."} 📜

---

## 🙌 **Acknowledgements**

Special thanks to all contributors and the open-source community for making this project possible! 🌟

---

## 👨‍💻 **Author**

Made by [${data.owner.login}](${data.owner.html_url})  

---

## 📫 **Contact**

Feel free to reach out for support or collaboration opportunities! 📬

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
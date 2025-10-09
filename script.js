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


// Parse GitHub repo URL

// Parse GitHub repo link
// Returns { owner, repo } or null
// 🔍 Parse GitHub Repo Link
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

// 📡 Fetch Repo Metadata
async function fetchRepoData(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error("❌ Repo not found or inaccessible");
  const data = await res.json();
  console.log("📦 Repo metadata fetched successfully");
  return data;
}

// 📁 Fetch Repo File List
async function fetchRepoFiles(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
  if (!res.ok) return [];
  const files = await res.json();
  console.log("📂 Repo file list loaded:", files.map(f => f.name));
  return files.map(f => f.name);
}

function generateReadme(data, files) {
  return `# 🚀 ${data.name}

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

Start the application and explore its features with ease. Here’s how you can get going: 🚦

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

// 🧠 DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const repoInput = document.getElementById("repoUrl");
  const generateBtn = document.getElementById("generateBtn");
  const generateBtnFab = document.getElementById("generateBtnFab");
  const readmeEditor = document.getElementById("readmeEditor");
  const readmePreview = document.getElementById("readmePreview");
  const downloadBtn = document.getElementById("downloadBtn");

  // 🛠 Generate README
  const generateReadmeHandler = async () => {
    const input = repoInput.value.trim();
    const info = parseRepoURL(input);
    if (!info) {
      alert("❌ Invalid GitHub link. Please check and try again.");
      return;
    }

    try {
      console.log("🔍 Fetching repo data...");
      const data = await fetchRepoData(info.owner, info.repo);
      const files = await fetchRepoFiles(info.owner, info.repo);
      const readme = generateReadme(data, files);

      readmeEditor.value = readme;
      readmePreview.innerHTML = marked.parse(readme);
      console.log("✅ README generated and previewed!");
    } catch (err) {
      alert("🚫 Could not fetch repo data. Try a public repo.");
      console.error("❌ Error:", err.message);
    }
  };

  generateBtn.addEventListener("click", generateReadmeHandler);
  generateBtnFab.addEventListener("click", generateReadmeHandler);

  // 🔄 Live Markdown Preview
  readmeEditor.addEventListener("input", () => {
    readmePreview.innerHTML = marked.parse(readmeEditor.value);
    console.log("🔁 Preview updated");
  });

  // 📥 Download README.md
  downloadBtn.addEventListener("click", () => {
    const content = readmeEditor.value;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    console.log("📁 README.md downloaded successfully 🎉");
  });
});
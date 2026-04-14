// Fade-in animation for sections
const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
});
sections.forEach((section) => observer.observe(section));

// Smooth scrolling for navigation links
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach((link) => {
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
  Features: `## Features\n\n- Feature 1: Description\n- Feature 2: Description\n- Feature 3: Description\n\n`,
  Installation: `## Installation\n\n### Prerequisites\n\n- Requirement 1\n- Requirement 2\n\n### Steps\n\n\`\`\`bash\n# Clone the repository\ngit clone https://github.com/username/repo.git\n\n# Navigate to the directory\ncd repo\n\n# Install dependencies\nnpm install\n\`\`\`\n\n`,
  Usage: `## Usage\n\n\`\`\`javascript\n// Example code\nconst example = new Example();\nexample.run();\n\`\`\`\n\n`,
  Contributing: `## Contributing\n\n1. Fork the repository\n2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)\n3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n5. Open a Pull Request\n\n`,
  Acknowledgements: `## Acknowledgements\n\n- Thanks to [Contributor](https://github.com/contributor)\n- Inspired by [Project](https://github.com/project)\n\n`,
  License: `## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`,
  Demo: `## Demo\n\nCheck out the live demo [here](https://demo-link.com).\n\n![Demo Screenshot](demo-screenshot.png)\n\n`,
  Documentation: `## Documentation\n\nFull documentation is available at [docs](https://docs-link.com).\n\n`,
  Authors: `## Authors\n\n- **Author Name** - *Role* - [GitHub](https://github.com/author)\n\n`,
  Appendix: `## Appendix\n\nAdditional information or references.\n\n`,
  Reference: `## Reference\n\n- [Reference 1](link)\n- [Reference 2](link)\n\n`,
};

// Ensure only one sidebar item is active at a time
document.querySelectorAll(".sidebar ul li").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar ul li")
      .forEach((li) => li.classList.remove("active"));
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
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "github.com" && hostname !== "www.github.com") {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!owner || !repo) return null;

    console.log("🔗 GitHub link parsed:", parts);
    return { owner, repo };
  } catch {
    console.warn("⚠️ Invalid GitHub URL format");
    return null;
  }
}

// Fetch Repo Metadata
async function fetchRepoData(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) {
    if (res.status === 404)
      throw new Error("Repository not found. Please check the URL.");
    if (res.status === 403)
      throw new Error(
        "Access forbidden. The repository might be private or you are rate limited."
      );
    if (res.status === 422) throw new Error("Invalid repository URL.");
    throw new Error(
      `Failed to fetch repo data: ${res.status} ${res.statusText}`
    );
  }
  const data = await res.json();
  console.log("Repo metadata fetched successfully");
  return data;
}

// Fetch Repo File List
async function fetchRepoFiles(owner, repo, defaultBranch = "main") {
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
      defaultBranch
    )}?recursive=1`
  );

  if (treeRes.ok) {
    const treeData = await treeRes.json();
    const treePaths = Array.isArray(treeData.tree)
      ? treeData.tree.map((item) => item.path)
      : [];
    console.log("Repo tree loaded:", treePaths.length, "paths");
    return treePaths;
  }

  if (treeRes.status === 403) {
    throw new Error(
      "Access forbidden. The repository might be private or you are rate limited."
    );
  }

  // Fallback for edge cases where tree API is unavailable.
  const contentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents`
  );
  if (!contentsRes.ok) {
    if (contentsRes.status === 404) return [];
    if (contentsRes.status === 403) {
      throw new Error("Access forbidden for repository file list.");
    }
    throw new Error(
      `Failed to fetch file list: ${contentsRes.status} ${contentsRes.statusText}`
    );
  }

  const files = await contentsRes.json();
  return files.map((f) => f.path || f.name);
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function fetchRepoFileContent(owner, repo, path, ref) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(
      path
    )}?ref=${encodeURIComponent(ref)}`
  );

  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 403) {
      throw new Error(
        "Access forbidden while reading repository files. You might be rate limited."
      );
    }
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }

  const payload = await res.json();
  if (!payload || payload.type !== "file" || !payload.content) return null;

  try {
    return atob(payload.content.replace(/\n/g, ""));
  } catch {
    return null;
  }
}

function getBestMatchPath(files, matcher) {
  const matches = files.filter((file) => matcher(file.toLowerCase()));
  if (!matches.length) return null;

  const rootMatch = matches.find((file) => !file.includes("/"));
  return rootMatch || matches.sort((a, b) => a.length - b.length)[0];
}

async function collectRepoInsights(owner, repo, ref, files) {
  const packageJsonPath = getBestMatchPath(files, (f) => f.endsWith("package.json"));
  const requirementsPath = getBestMatchPath(
    files,
    (f) => f.endsWith("requirements.txt")
  );
  const pyprojectPath = getBestMatchPath(files, (f) => f.endsWith("pyproject.toml"));

  const [packageJsonText, requirementsText, pyprojectText] = await Promise.all([
    packageJsonPath
      ? fetchRepoFileContent(owner, repo, packageJsonPath, ref)
      : Promise.resolve(null),
    requirementsPath
      ? fetchRepoFileContent(owner, repo, requirementsPath, ref)
      : Promise.resolve(null),
    pyprojectPath
      ? fetchRepoFileContent(owner, repo, pyprojectPath, ref)
      : Promise.resolve(null),
  ]);

  let packageJson = null;
  if (packageJsonText) {
    try {
      packageJson = JSON.parse(packageJsonText);
    } catch {
      packageJson = null;
    }
  }

  const requirements = requirementsText
    ? requirementsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .slice(0, 8)
    : [];

  return {
    packageJson,
    requirements,
    hasPyproject: Boolean(pyprojectText),
    hasDocker: files.some((f) => /(^|\/)dockerfile$/i.test(f)),
    hasTests: files.some((f) => /(^|\/)(test|tests|__tests__)($|\/)/i.test(f)),
    hasDocs: files.some((f) => /(^|\/)(docs|documentation)($|\/)/i.test(f)),
    hasCI: files.some((f) => f.toLowerCase().startsWith(".github/workflows/")),
  };
}

function generateReadme(data, files, insights = {}, preset = "professional") {
  const normalizedFiles = Array.from(
    new Set(files.map((file) => file.trim()).filter(Boolean))
  );
  const lowerFiles = normalizedFiles.map((f) => f.toLowerCase());

  const hasFile = (name) => lowerFiles.some((file) => file.endsWith(name));

  const bannerFile = normalizedFiles.find((f) =>
    /banner\.(png|jpg|jpeg|gif|svg)$/i.test(f)
  );
  const gifBannerFile = normalizedFiles.find((f) => /banner\.gif$/i.test(f));
  const logoFile = normalizedFiles.find((f) =>
    /(^|\/)logo\.(png|jpg|jpeg|gif|svg)$/i.test(f)
  );

  const aiLogoURL =
    "https://api.dicebear.com/7.x/shapes/svg?seed=" +
    encodeURIComponent(data.name || data.full_name || "project");

  const bannerPath = bannerFile ? `./${bannerFile}` : null;
  const gifBannerPath = gifBannerFile ? `./${gifBannerFile}` : null;
  const logoPath = logoFile ? `./${logoFile}` : aiLogoURL;

  const ecosystem = (() => {
    if (insights.packageJson || hasFile("package.json")) return "node";
    if (hasFile("requirements.txt") || insights.hasPyproject) return "python";
    if (hasFile("go.mod")) return "go";
    if (hasFile("cargo.toml")) return "rust";
    if (hasFile("pom.xml") || hasFile("build.gradle") || hasFile("build.gradle.kts")) {
      return "java";
    }
    if (hasFile("composer.json")) return "php";
    return "generic";
  })();

  const summaryPoints = [];
  if (normalizedFiles.some((f) => /(^|\/)src(\/|$)/i.test(f))) {
    summaryPoints.push("structured source code in a src directory");
  }
  if (insights.hasTests) summaryPoints.push("automated tests");
  if (insights.hasDocs) summaryPoints.push("documentation assets");
  if (insights.hasDocker) summaryPoints.push("container support");
  if (insights.hasCI) summaryPoints.push("CI workflows");

  const fallbackDescription = [
    "A maintainable repository with practical project structure and clear setup steps.",
    summaryPoints.length
      ? `Detected project capabilities include ${summaryPoints.join(", ")}.`
      : "Project layout was analyzed to generate a quick-start README template.",
  ].join("\n\n");

  const projectDescription = data.description || fallbackDescription;

  const badgeMap = {
    ".js": "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)",
    ".jsx": "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)",
    ".ts": "![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)",
    ".tsx": "![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)",
    ".py": "![Python](https://img.shields.io/badge/Python-3670A0?logo=python&logoColor=white)",
    ".go": "![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white)",
    ".rs": "![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)",
    ".java": "![Java](https://img.shields.io/badge/Java-007396?logo=java&logoColor=white)",
    ".kt": "![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?logo=kotlin&logoColor=white)",
    ".php": "![PHP](https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white)",
    ".rb": "![Ruby](https://img.shields.io/badge/Ruby-CC342D?logo=ruby&logoColor=white)",
    ".html": "![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)",
    ".css": "![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)",
  };

  const langBadges = Array.from(
    new Set(
      normalizedFiles.flatMap((file) => {
        const lower = file.toLowerCase();
        return Object.entries(badgeMap)
          .filter(([ext]) => lower.endsWith(ext))
          .map(([, badge]) => badge);
      })
    )
  );

  const metadataBadges = [
    `![Stars](https://img.shields.io/github/stars/${data.full_name}?style=social)`,
    `![Forks](https://img.shields.io/github/forks/${data.full_name}?style=social)`,
    `![Issues](https://img.shields.io/github/issues/${data.full_name})`,
  ];

  if (data.license?.spdx_id) {
    metadataBadges.push(
      `![License](https://img.shields.io/badge/license-${encodeURIComponent(
        data.license.spdx_id
      )}-blue)`
    );
  }

  const normalizeProfileUrl = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  };

  const links = [];
  if (data.homepage) links.push(`- Live Demo: ${data.homepage}`);
  links.push(`- Repository: ${data.html_url}`);
  if (data.has_issues) links.push(`- Issues: ${data.html_url}/issues`);

  const profileLinks = [
    `<a href="https://github.com/${data.owner.login}"><img src="https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github" /></a>`,
  ];

  if (data.owner?.twitter_username) {
    profileLinks.push(
      `<a href="https://twitter.com/${data.owner.twitter_username}"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter" /></a>`
    );
  }

  const blogUrl = normalizeProfileUrl(data.owner?.blog || data.blog);
  if (blogUrl) {
    profileLinks.push(
      `<a href="${blogUrl}"><img src="https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome" /></a>`
    );
  }

  const installCommand = (() => {
    if (ecosystem === "node") {
      if (insights.packageJson?.packageManager?.startsWith("pnpm")) return "pnpm install";
      if (insights.packageJson?.packageManager?.startsWith("yarn")) return "yarn install";
      return "npm install";
    }
    if (ecosystem === "python") {
      if (hasFile("requirements.txt")) return "pip install -r requirements.txt";
      if (insights.hasPyproject) return "pip install .";
    }
    if (ecosystem === "go") return "go mod tidy";
    if (ecosystem === "rust") return "cargo build";
    if (ecosystem === "java") return hasFile("pom.xml") ? "mvn install" : "./gradlew build";
    if (ecosystem === "php") return "composer install";
    return "# Add install commands here";
  })();

  const runCommand = (() => {
    const scripts = insights.packageJson?.scripts || {};
    if (ecosystem === "node") {
      if (scripts.start) return "npm run start";
      if (scripts.dev) return "npm run dev";
      return "npm run build";
    }
    if (ecosystem === "python") return "python main.py";
    if (ecosystem === "go") return "go run .";
    if (ecosystem === "rust") return "cargo run";
    if (ecosystem === "java") return hasFile("pom.xml") ? "mvn spring-boot:run" : "./gradlew run";
    if (ecosystem === "php") return "php -S localhost:8000";
    return "# Add run command here";
  })();

  const topDependencies = (() => {
    if (insights.packageJson) {
      const deps = Object.keys(insights.packageJson.dependencies || {});
      const devDeps = Object.keys(insights.packageJson.devDependencies || {});
      return [...deps, ...devDeps].slice(0, 8);
    }
    if (insights.requirements?.length) {
      return insights.requirements.map((entry) => entry.split(/[<>=]/)[0]).slice(0, 8);
    }
    return [];
  })();

  function generateFolderTree(paths, maxLines = 80) {
    const tree = {};

    paths.forEach((path) => {
      const parts = path.split("/");
      let curr = tree;
      parts.forEach((part, index) => {
        if (!curr[part]) {
          curr[part] = index === parts.length - 1 ? null : {};
        }
        curr = curr[part];
      });
    });

    const lines = [`${data.name}`];
    const render = (node, prefix = "") => {
      const entries = Object.entries(node);
      for (let index = 0; index < entries.length; index += 1) {
        if (lines.length >= maxLines) {
          lines.push(`${prefix}└── ...`);
          return;
        }

        const [name, value] = entries[index];
        const isLast = index === entries.length - 1;
        const branch = isLast ? "└── " : "├── ";
        lines.push(`${prefix}${branch}${name}`);

        if (value !== null) {
          render(value, `${prefix}${isLast ? "    " : "│   "}`);
        }
      }
    };

    render(tree);
    return lines.join("\n");
  }

  const selectedPreset = ["minimal", "professional", "marketing"].includes(preset)
    ? preset
    : "professional";

  const presetMeta = {
    minimal: {
      includeHeroMedia: false,
      titlePrefix: "",
      overviewTitle: "Overview",
      includeToc: false,
      includeTopics: false,
      includeDependencies: false,
      includeSocialLinks: false,
      includeSupport: false,
    },
    professional: {
      includeHeroMedia: true,
      titlePrefix: "",
      overviewTitle: "Overview",
      includeToc: true,
      includeTopics: true,
      includeDependencies: true,
      includeSocialLinks: true,
      includeSupport: false,
    },
    marketing: {
      includeHeroMedia: true,
      titlePrefix: "🚀 ",
      overviewTitle: "Why This Project",
      includeToc: true,
      includeTopics: true,
      includeDependencies: true,
      includeSocialLinks: true,
      includeSupport: true,
    },
  };

  const style = presetMeta[selectedPreset];

  const toc = [
    `- [${style.overviewTitle}](#${style.overviewTitle
      .toLowerCase()
      .replace(/\s+/g, "-")})`,
    "- [Features](#features)",
    "- [Tech Stack](#tech-stack)",
    "- [Installation](#installation)",
    "- [Usage](#usage)",
    "- [Project Structure](#project-structure)",
    "- [Contributing](#contributing)",
    "- [License](#license)",
  ];

  const featureBullets = [
    "Repository-aware README generation",
    "Auto-detected language and ecosystem hints",
    "Project structure summary from repository tree",
  ];
  if (insights.hasTests) featureBullets.push("Testing-ready project layout");
  if (insights.hasCI) featureBullets.push("CI workflow support");
  if (insights.hasDocker) featureBullets.push("Containerized deployment setup");

  const topicsSection = style.includeTopics && Array.isArray(data.topics) && data.topics.length
    ? `\n## Topics\n\n${data.topics.map((topic) => `- ${topic}`).join("\n")}\n`
    : "";

  const dependenciesSection = style.includeDependencies && topDependencies.length
    ? `\n## Key Dependencies\n\n${topDependencies
        .map((dep) => `- ${dep}`)
        .join("\n")}\n`
    : "";

  const headerMedia = style.includeHeroMedia
    ? `
${
  gifBannerPath
    ? `<p align="center"><img src="${gifBannerPath}" width="100%" alt="Project banner" /></p>`
    : bannerPath
    ? `<p align="center"><img src="${bannerPath}" width="100%" alt="Project banner" /></p>`
    : ""
}

<p align="center">
  <img src="${logoPath}" width="120" alt="${data.name} logo" />
</p>
`
    : "";

  const marketingLead =
    selectedPreset === "marketing"
      ? `\nBuild faster, ship confidently, and give your users a polished first impression with ${data.name}.\n`
      : "";

  const supportSection = style.includeSupport
    ? `
## Support

If this project helps your workflow, give it a star and share it with your developer community.
`
    : "";

  const socialSection = style.includeSocialLinks
    ? `
## Author

- ${data.owner?.login || "Maintainer"}

<p align="center">
  ${profileLinks.join(" ")}
</p>
`
    : `
## Author

- ${data.owner?.login || "Maintainer"}
`;

  const tocSection = style.includeToc
    ? `
## Table of Contents

${toc.join("\n")}
`
    : "";

  return `
${headerMedia}

# ${style.titlePrefix}${data.name}

${metadataBadges.join(" ")}

${langBadges.join(" ")}

## ${style.overviewTitle}

${projectDescription}

${marketingLead}

${links.join("\n")}

${topicsSection}

${tocSection}

## Features

${featureBullets.map((feature) => `- ${feature}`).join("\n")}

## Tech Stack

- Primary language: ${data.language || "Not specified"}
- Ecosystem: ${ecosystem}
- Default branch: ${data.default_branch || "main"}

${dependenciesSection}

## Installation

\`\`\`bash
git clone ${data.clone_url}
cd ${data.name}
${installCommand}
\`\`\`

## Usage

\`\`\`bash
${runCommand}
\`\`\`

## Project Structure

\`\`\`text
${generateFolderTree(normalizedFiles)}
\`\`\`

## Contributing

Contributions are welcome. Please open an issue first for major changes and submit a pull request with a clear description.

${socialSection}

${supportSection}

## License

${data.license?.name || "No license provided"}
`.trim();
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const repoInput = document.getElementById("repoInput");
  const readmeStyle = document.getElementById("readmeStyle");
  const generateBtn = document.getElementById("generateBtn");
  const generateBtnFab = document.getElementById("generateBtnFab");
  const readmeEditor = document.getElementById("readmeEditor");
  const readmePreview = document.getElementById("readmePreview");
  const downloadBtn = document.getElementById("downloadBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");

  if (
    !repoInput ||
    !generateBtn ||
    !readmeEditor ||
    !readmePreview ||
    !downloadBtn ||
    !clearBtn ||
    !copyBtn
  ) {
    return;
  }

  // Function to toggle visibility of clear and copy buttons based on editor content
  function toggleButtons() {
    const hasText = readmeEditor.value.trim() !== "";
    clearBtn.style.display = hasText ? "inline-block" : "none";
    copyBtn.style.display = hasText ? "inline-block" : "none";
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
      const files = await fetchRepoFiles(
        info.owner,
        info.repo,
        data.default_branch
      );
      const insights = await collectRepoInsights(
        info.owner,
        info.repo,
        data.default_branch,
        files
      );
      const preset = readmeStyle?.value || "professional";
      const readme = generateReadme(data, files, insights, preset);

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
  if (generateBtnFab) {
    generateBtnFab.addEventListener("click", generateReadmeHandler);
  }

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
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("README content copied to clipboard");
        alert("README content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy content. Please try manually.");
      });
  });
});

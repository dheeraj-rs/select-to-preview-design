"use client";

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ComponentPosition, Website } from './website-store';

export const exportAsHTML = async (website: Website) => {
  // In a real implementation, this would generate HTML, CSS, and JS files
  const zip = new JSZip();
  
  // Create index.html
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${website.name}</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <div id="app">
        <!-- Generated content would go here -->
        <h1>${website.name}</h1>
        ${website.pages.map(page => `
          <div class="page" id="${page.slug}">
            ${page.content}
          </div>
        `).join('\n')}
      </div>
      <script src="script.js"></script>
    </body>
    </html>
  `;
  
  // Create styles.css
  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    
    #app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
  `;
  
  // Create script.js
  const js = `
    // JavaScript for your website
    console.log('Website loaded');
  `;
  
  // Add files to zip
  zip.file("index.html", html);
  zip.file("styles.css", css);
  zip.file("script.js", js);
  
  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "my-website.zip");
};

export const exportAsNextJS = async (website: Website) => {
  // In a real implementation, this would generate a complete Next.js project
  const zip = new JSZip();
  
  // Create basic Next.js files
  zip.file("package.json", JSON.stringify({
    name: website.name.toLowerCase().replace(/\s+/g, '-'),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start"
    },
    dependencies: {
      next: "^14.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }, null, 2));
  
  // Create basic Next.js app structure
  const appFolder = zip.folder("app");
  appFolder?.file("page.tsx", `
    export default function Home() {
      return (
        <main>
          <h1>Your Exported Website</h1>
          <p>This is a placeholder for your exported Next.js website.</p>
        </main>
      );
    }
  `);
  
  appFolder?.file("layout.tsx", `
    export const metadata = {
      title: 'My Website',
      description: 'Created with Nexus Website Builder',
    };
    
    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      );
    }
  `);
  
  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "my-nextjs-project.zip");
};

export const exportAsAstro = async (website: Website) => {
  // In a real implementation, this would generate a complete Astro project
  const zip = new JSZip();
  
  // Create basic Astro files
  zip.file("package.json", JSON.stringify({
    name: website.name.toLowerCase().replace(/\s+/g, '-'),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview"
    },
    dependencies: {
      astro: "^3.0.0"
    }
  }, null, 2));
  
  // Create basic Astro structure
  zip.file("astro.config.mjs", `
    import { defineConfig } from 'astro/config';
    export default defineConfig({});
  `);
  
  const srcFolder = zip.folder("src");
  const pagesFolder = srcFolder?.folder("pages");
  pagesFolder?.file("index.astro", `
    ---
    // Your Astro component script here
    ---
    
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>My Website</title>
      </head>
      <body>
        <h1>Your Exported Website</h1>
        <p>This is a placeholder for your exported Astro website.</p>
      </body>
    </html>
  `);
  
  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "my-astro-project.zip");
};

// New function to generate site output folder for Netlify deployment
export const generateSiteOutputFolder = async (website: Website) => {
  // Create a website output folder structure
  const zip = new JSZip();
  
  // Create index.html with proper content
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.name}</title>
  <meta name="description" content="${website.description || 'Created with Nexus Website Builder'}">
  <link rel="stylesheet" href="./css/styles.css">
  <link rel="icon" href="./favicon.ico" type="image/x-icon">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="logo">${website.name}</div>
        <ul class="nav-links">
          ${website.pages.map(page => `<li><a href="#${page.slug}">${page.title}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </nav>
  </header>
  
  <main class="container">
    ${website.pages.map(page => `
    <section id="${page.slug}" class="page-section">
      <div class="page-content">
        ${page.content}
      </div>
    </section>
    `).join('\n    ')}
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${website.name}. All rights reserved.</p>
    </div>
  </footer>

  <script src="./js/main.js"></script>
</body>
</html>
  `;
  
  // Add index.html
  zip.file("index.html", indexHtml);
  
  // Create CSS folder and styles
  const cssFolder = zip.folder("css");
  cssFolder?.file("styles.css", `
/* Base styles */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --text-color: #333;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #fff;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Navigation */
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary-color);
}

/* Main content */
main {
  padding: 3rem 0;
}

.page-section {
  margin-bottom: 4rem;
  scroll-margin-top: 5rem;
}

.page-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

h1, h2, h3 {
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

p {
  margin-bottom: 1.5rem;
}

/* Footer */
footer {
  background-color: var(--dark-color);
  color: #fff;
  padding: 2rem 0;
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
  
  .nav-links li {
    margin-left: 0;
  }
}
  `);
  
  // Create JS folder and main script
  const jsFolder = zip.folder("js");
  jsFolder?.file("main.js", `
// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('${website.name} website loaded successfully!');
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });
});
  `);
  
  // Create images folder and add a placeholder image
  const imagesFolder = zip.folder("images");
  // You would typically add actual images here
  
  // Add a placeholder favicon
  zip.file("favicon.ico", "", {base64: true});
  
  // Add netlify.toml for configuration
  zip.file("netlify.toml", `
[build]
  publish = "/"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  `);
  
  // Generate zip file for downloading
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${website.name.toLowerCase().replace(/\s+/g, '-')}-netlify-ready.zip`);
  
  return content;
};
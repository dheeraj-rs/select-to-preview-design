import { supabase } from './supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useWebsiteStore, Website } from '@/lib/website-store';
import { generateSiteOutputFolder } from '@/lib/export-utils';

// Netlify API endpoint
const NETLIFY_API = 'https://api.netlify.com/api/v1';

export interface DeploymentResult {
  success: boolean;
  deploymentUrl?: string;
  previewUrl?: string;
  error?: string;
  deploymentId?: string;
  isDemo?: boolean;
}

export interface DeploymentOptions {
  website: Website;
  siteName: string;
  token: string;
  isDemo?: boolean;
}

// Deploy options with deployment timeouts
interface DeployOptions {
  timeout?: number;
  showProgress?: boolean;
  netlifyToken?: string;
}

interface SiteContent {
  zipBlob: Blob;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
}

// Deploy site to Netlify and get a real live URL
export async function deployToNetlify({ website, siteName, token, isDemo = false }: DeploymentOptions): Promise<DeploymentResult> {
  try {
    const startTime = Date.now();
    console.log('Starting deployment process:', { siteName });
    
    // Get the current export format from the store
    const store = useWebsiteStore.getState();
    const exportFormat = store.exportFormat || 'html';
    
    // Default options with format-specific timeouts
    const { 
      timeout = exportFormat === 'html' ? 8000 : 15000,
      showProgress = true,
      netlifyToken = process.env.NEXT_PUBLIC_NETLIFY_TOKEN 
    } = {} as DeployOptions;

    // Validate token format
    if (!netlifyToken) {
      throw new Error('Netlify token is required for deployment');
    }

    if (!netlifyToken.startsWith('netlifytoken_')) {
      throw new Error('Invalid Netlify token format. Token must start with "netlifytoken_"');
    }

    // Validate site name format
    if (siteName && !/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(siteName)) {
      throw new Error('Site name must contain only lowercase letters, numbers, and hyphens');
    }

    // Create a unique site ID if not provided
    const siteId = siteName || `nexus-site-${generateRandomId()}`;

    // Generate site content
    const siteContent = await generateSiteContent(website, siteName, false);
    
    // Create site on Netlify
    const createSiteResponse = await fetch(`${NETLIFY_API}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: siteId,
        custom_domain: null,
        build_settings: {
          cmd: '',
          dir: '',
          env: {}
        }
      })
    });

    if (!createSiteResponse.ok) {
      const errorData = await createSiteResponse.json();
      throw new Error(`Failed to create site: ${errorData.message || createSiteResponse.statusText}`);
    }

    const site = await createSiteResponse.json();

    // Deploy the site content
    const deployResponse = await fetch(`${NETLIFY_API}/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip'
      },
      body: siteContent.zipBlob
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json();
      throw new Error(`Deployment failed: ${errorData.message || deployResponse.statusText}`);
    }

    const deployment = await deployResponse.json();

    // Poll deployment status
    let status = deployment.state;
    let retries = 0;
    const maxRetries = 30;

    while (status !== 'ready' && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`${NETLIFY_API}/sites/${site.id}/deploys/${deployment.id}`, {
        headers: {
          'Authorization': `Bearer ${netlifyToken}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        status = statusData.state;

        if (status === 'error') {
          throw new Error(`Deployment failed: ${statusData.error_message || 'Unknown error'}`);
        }
      }

      retries++;
    }

    if (status !== 'ready') {
      throw new Error('Deployment timed out');
    }

    // Update the success return object
    return {
      success: true,
      deploymentUrl: `https://${siteId}.netlify.app`,
      previewUrl: await generateSitePreview(website, siteId),
      deploymentId: deployment.id,
      isDemo
    };

  } catch (error: any) {
    console.error('Deployment failed:', error);
    return {
      success: false,
      error: error.message,
      isDemo
    };
  }
}

// Helper function to validate Netlify token
function validateNetlifyToken(token: string): boolean {
  if (!token) return false;
  if (!token.startsWith('netlifytoken_')) return false;
  if (token.length < 50) return false;
  return true;
}

// Helper function to generate site preview
async function generateSitePreview(website: Website, siteName: string): Promise<string> {
  const { components } = useWebsiteStore.getState();
  const previewHtml = generateHTMLContent(components, siteName);
  return previewHtml;
}

// Helper function to save deployment history
async function saveDeploymentHistory(projectId: string, deploymentInfo: any) {
  try {
    await supabase
      .from('deployments')
      .insert([{
        project_id: projectId,
        site_name: deploymentInfo.siteId,
        url: deploymentInfo.url,
        deploy_time: deploymentInfo.deployTime,
        status: 'success'
      }]);
  } catch (error) {
    console.error('Failed to save deployment history:', error);
  }
}

// Download ZIP file helper
function downloadZipFile(zipBlob: Blob, siteName: string) {
  try {
    saveAs(zipBlob, `${siteName}.zip`);
    console.log('Site package downloaded successfully');
  } catch (error) {
    console.error('Error downloading site package:', error);
  }
}

// Actual Netlify API deployment
async function deployToNetlifyAPI(siteName: string, zipBlob: Blob, netlifyToken: string, 
  { onProgress }: { onProgress: (progress: number, message: string) => void }) {
  
  try {
    // Validate token format
    if (!netlifyToken.startsWith('netlifytoken_')) {
      throw new Error('Invalid Netlify token format. Token should start with "netlifytoken_"');
    }

    // Update progress
    onProgress(5, 'Creating Netlify site...');
    
    // 1. Create a new site on Netlify with build settings
    const createSiteResponse = await fetch(`${NETLIFY_API}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Nexus-Website-Builder'
      },
      body: JSON.stringify({
        name: siteName,
        custom_domain: null,
        build_settings: {
          cmd: '',
          dir: '',
          env: {}
        }
      }),
    });

    if (!createSiteResponse.ok) {
      const errorData = await createSiteResponse.json().catch(() => ({}));
      console.error('Site creation response:', createSiteResponse.status, errorData);
      throw new Error(`Failed to create Netlify site: ${errorData.message || createSiteResponse.statusText}`);
    }
    
    const siteData = await createSiteResponse.json();
    const siteId = siteData.id;
    const siteUrl = siteData.ssl_url || siteData.url;
    
    // Record the actual site URL for later use
    const actualSiteUrl = `https://${siteName}.netlify.app`;
    
    onProgress(20, 'Site created. Preparing deployment...');
    
    // 2. Deploy to the site
    // Convert Blob to ArrayBuffer for the upload
    const arrayBuffer = await zipBlob.arrayBuffer();
    
    onProgress(30, 'Uploading files...');
    
    const deployResponse = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip',
        'Content-Length': zipBlob.size.toString(),
        'User-Agent': 'Nexus-Website-Builder'
      },
      body: arrayBuffer,
    });
    
    if (!deployResponse.ok) {
      const errorData = await deployResponse.json().catch(() => ({}));
      console.error('Deploy response:', deployResponse.status, errorData);
      throw new Error(`Failed to deploy to Netlify: ${errorData.message || deployResponse.statusText}`);
    }
    
    onProgress(60, 'Files uploaded. Building site...');
    
    const deployData = await deployResponse.json();
    
    // 3. Poll for deployment status
    let deploymentComplete = false;
    let deploymentSuccess = false;
    let deploymentId = deployData.id;
    let finalUrl = actualSiteUrl;
    let retryCount = 0;
    const maxRetries = 30; // Maximum number of status checks
    
    onProgress(70, 'Waiting for deployment to complete...');
    
    // Poll until deployment is complete
    while (!deploymentComplete && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      
      const statusResponse = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'User-Agent': 'Nexus-Website-Builder'
        },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.state === 'ready') {
          deploymentComplete = true;
          deploymentSuccess = true;
          onProgress(100, 'Deployment complete!');
          finalUrl = statusData.ssl_url || statusData.url || actualSiteUrl;
        } else if (statusData.state === 'error') {
          deploymentComplete = true;
          deploymentSuccess = false;
          const errorMessage = statusData.error_message || 'Unknown deployment error';
          onProgress(100, `Deployment failed: ${errorMessage}`);
          throw new Error(`Deployment failed: ${errorMessage}`);
        } else {
          // Still in progress
          retryCount++;
          onProgress(80, `Building site (${statusData.state})...`);
        }
      } else {
        retryCount++;
        console.warn(`Failed to check deployment status (attempt ${retryCount}/${maxRetries})`);
      }
    }
    
    if (retryCount >= maxRetries) {
      throw new Error('Deployment timed out. Please check your Netlify dashboard for status.');
    }
    
    if (deploymentSuccess) {
      return {
        success: true,
        url: finalUrl,
        siteId: siteId,
        siteName: siteName,
        deploymentTime: (Date.now() - deployData.created_at) / 1000,
        isDemo: false,
      };
    } else {
      throw new Error('Deployment failed with unknown error');
    }
  } catch (error) {
    console.error('Netlify API deployment failed:', error);
    throw error;
  }
}

// Generate site content and return both HTML and ZIP package
async function generateSiteContent(website: Website, siteName: string, downloadZip = true) {
  try {
    // Use the new function to generate site content
    const siteContent = await generateSiteOutputFolder(website);
    
    // Get export format from the store
    const store = useWebsiteStore.getState();
    const exportFormat = store.exportFormat || 'html';
    
    // Download the ZIP file for the user if requested
    if (downloadZip) {
      saveAs(siteContent, `${siteName}-netlify-ready.zip`);
    }
    
    return {
      zipBlob: siteContent,
      htmlContent: '', // These are not used in the new implementation
      cssContent: '',
      jsContent: '',
      format: exportFormat
    };
  } catch (error) {
    console.error('Error generating site content:', error);
    throw error;
  }
}

// Add React/Next.js project files to the ZIP
function addReactProjectFiles(zip: JSZip, components: any[], siteName: string) {
  // Create necessary folders
  const pagesFolder = zip.folder("pages");
  const componentsFolder = zip.folder("components");
  const stylesFolder = zip.folder("styles");
  const publicFolder = zip.folder("public");
  
  if (!pagesFolder || !componentsFolder || !stylesFolder || !publicFolder) {
    throw new Error("Failed to create project folders");
  }
  
  // Add package.json
  zip.file("package.json", generatePackageJson(siteName));
  
  // Add next.config.js or react config
  if (useWebsiteStore.getState().exportFormat === 'nextjs') {
    zip.file("next.config.js", generateNextConfig());
  } else {
    zip.file("vite.config.js", generateViteConfig());
  }
  
  // Add index page
  pagesFolder.file("index.js", generateReactIndexPage(components, siteName));
  
  // Add _app.js for Next.js
  pagesFolder.file("_app.js", generateNextApp());
  
  // Add component files
  components.forEach((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      componentsFolder.file(`${componentName}.js`, generateReactComponent(component, componentName));
    }
  });
  
  // Add global styles
  stylesFolder.file("globals.css", generateCSSContent());
  
  // Add favicon to public folder
  publicFolder.file("favicon.ico", "");
}

// Add Astro project files to the ZIP
function addAstroProjectFiles(zip: JSZip, components: any[], siteName: string) {
  // Create necessary folders
  const srcFolder = zip.folder("src");
  if (!srcFolder) {
    throw new Error("Failed to create src folder");
  }
  
  const pagesFolder = srcFolder.folder("pages");
  const componentsFolder = srcFolder.folder("components");
  const layoutsFolder = srcFolder.folder("layouts");
  const stylesFolder = srcFolder.folder("styles");
  const publicFolder = zip.folder("public");
  
  if (!pagesFolder || !componentsFolder || !layoutsFolder || !stylesFolder || !publicFolder) {
    throw new Error("Failed to create project folders");
  }
  
  // Add package.json
  zip.file("package.json", generateAstroPackageJson(siteName));
  
  // Add astro.config.mjs
  zip.file("astro.config.mjs", generateAstroConfig());
  
  // Add index page
  pagesFolder.file("index.astro", generateAstroIndexPage(components, siteName));
  
  // Add layout
  layoutsFolder.file("Layout.astro", generateAstroLayout(siteName));
  
  // Add component files
  components.forEach((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      componentsFolder.file(`${componentName}.astro`, generateAstroComponent(component, componentName));
    }
  });
  
  // Add global styles
  stylesFolder.file("global.css", generateCSSContent());
  
  // Add favicon to public folder
  publicFolder.file("favicon.ico", "");
}

// Generate package.json for React/Next.js
function generatePackageJson(siteName: string) {
  const isNextJs = useWebsiteStore.getState().exportFormat === 'nextjs';
  
  return JSON.stringify({
    "name": siteName.toLowerCase().replace(/\s+/g, '-'),
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": isNextJs ? "next dev" : "vite",
      "build": isNextJs ? "next build" : "vite build",
      "start": isNextJs ? "next start" : "vite preview",
      "lint": isNextJs ? "next lint" : "eslint src"
    },
    "dependencies": {
      ...(isNextJs ? {
        "next": "^13.4.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      } : {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.10.0"
      })
    },
    "devDependencies": {
      ...(isNextJs ? {
        "eslint": "^8.38.0",
        "eslint-config-next": "^13.4.0"
      } : {
        "@vitejs/plugin-react": "^4.0.0",
        "eslint": "^8.38.0",
        "vite": "^4.3.1"
      })
    }
  }, null, 2);
}

// Generate package.json for Astro
function generateAstroPackageJson(siteName: string) {
  return JSON.stringify({
    "name": siteName.toLowerCase().replace(/\s+/g, '-'),
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "astro dev",
      "start": "astro dev",
      "build": "astro build",
      "preview": "astro preview"
    },
    "dependencies": {
      "astro": "^2.3.0"
    },
    "devDependencies": {}
  }, null, 2);
}

// Generate next.config.js
function generateNextConfig() {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
`;
}

// Generate vite.config.js
function generateViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
}

// Generate astro.config.mjs
function generateAstroConfig() {
  return `import { defineConfig } from 'astro/config';

export default defineConfig({
  // Your configuration options here
});
`;
}

// Generate React index page
function generateReactIndexPage(components: any[], siteName: string) {
  const imports = components.map((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      return `import ${componentName} from '../components/${componentName}';`;
    }
    return '';
  }).filter(Boolean).join('\n');
  
  const componentJsx = components.map((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      return `      <${componentName} {...${JSON.stringify(component)}} />`;
    }
    return '';
  }).filter(Boolean).join('\n');
  
  return `import Head from 'next/head';
import styles from '../styles/Home.module.css';
${imports}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>${siteName}</title>
        <meta name="description" content="${siteName}" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
${componentJsx}
      </main>

      <footer className={styles.footer}>
        <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`;
}

// Generate Next.js _app.js
function generateNextApp() {
  return `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
}

// Generate React component
function generateReactComponent(component: any, componentName: string) {
  const props = component || {};
  
  let template = '';
  
  switch (componentName.toLowerCase()) {
    case 'hero':
      template = `
export default function ${componentName}(props) {
  return (
    <section className="hero">
      <h1>{props.title || 'Welcome'}</h1>
      <p>{props.subtitle || 'This is a subtitle'}</p>
      {props.buttonText && <button className="btn">{props.buttonText}</button>}
    </section>
  );
}`;
      break;
    case 'navbar':
      template = `
export default function ${componentName}(props) {
  return (
    <nav className="navbar">
      <div className="logo">{props.logo || 'Logo'}</div>
      <ul className="nav-links">
        {props.links ? props.links.map((link, index) => (
          <li key={index}><a href={link.url || '#'}>{link.text || 'Link'}</a></li>
        )) : (
          <>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </>
        )}
      </ul>
    </nav>
  );
}`;
      break;
    default:
      template = `
export default function ${componentName}(props) {
  return (
    <div className="component ${componentName.toLowerCase()}">
      <h2>{props.title || '${componentName}'}</h2>
      <p>{props.content || 'Content goes here'}</p>
    </div>
  );
}`;
  }
  
  return template;
}

// Generate Astro index page
function generateAstroIndexPage(components: any[], siteName: string) {
  const componentImports = components.map((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      return `import ${componentName} from '../components/${componentName}.astro';`;
    }
    return '';
  }).filter(Boolean).join('\n');
  
  const componentTags = components.map((component, index) => {
    if (component && component.type) {
      const componentName = component.type.charAt(0).toUpperCase() + component.type.slice(1);
      const props = Object.entries(component)
        .filter(([key]) => key !== 'type')
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return `<${componentName} ${props} />`;
    }
    return '';
  }).filter(Boolean).join('\n');
  
  return `---
import Layout from '../layouts/Layout.astro';
${componentImports}
---

<Layout title="${siteName}">
  <main>
    ${componentTags}
  </main>
</Layout>

<style>
  main {
    margin: auto;
    padding: 1.5rem;
    max-width: 1200px;
  }
</style>
`;
}

// Generate Astro layout
function generateAstroLayout(siteName: string) {
  return `---
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <title>{title}</title>
    <link rel="stylesheet" href="../styles/global.css" />
  </head>
  <body>
    <slot />
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </footer>
  </body>
</html>

<style>
  footer {
    text-align: center;
    padding: 2rem;
    background: #f8f9fa;
    margin-top: 2rem;
    border-top: 1px solid #e9ecef;
  }
</style>
`;
}

// Generate Astro component
function generateAstroComponent(component: any, componentName: string) {
  const props = Object.keys(component || {})
    .filter(key => key !== 'type')
    .map(key => `${key}: string = ''`)
    .join(', ');
  
  let template = '';
  
  switch (componentName.toLowerCase()) {
    case 'hero':
      template = `---
export interface Props {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const { title = 'Welcome', subtitle = 'This is a subtitle', buttonText = '' } = Astro.props;
---

<section class="hero">
  <h1>{title}</h1>
  <p>{subtitle}</p>
  {buttonText && <button class="btn">{buttonText}</button>}
</section>

<style>
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(to right, #f8f9fa, #e9ecef);
    margin-bottom: 2rem;
  }
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.2rem;
    color: #6c757d;
    margin-bottom: 2rem;
  }
  .btn {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }
  .btn:hover {
    background-color: #0069d9;
  }
</style>`;
      break;
    default:
      template = `---
export interface Props {
  title?: string;
  content?: string;
}

const { title = '${componentName}', content = 'Content goes here' } = Astro.props;
---

<div class="component ${componentName.toLowerCase()}">
  <h2>{title}</h2>
  <p>{content}</p>
</div>

<style>
  .component {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }
  h2 {
    margin-bottom: 1rem;
    color: #343a40;
  }
  p {
    color: #6c757d;
  }
</style>`;
  }
  
  return template;
}

// Generate README.md with deployment instructions
function generateReadme(siteName: string, format: string) {
  const formatInstructions = {
    html: `
## Deployment Instructions

### Deploy to Netlify
1. Create a new site in Netlify
2. Drag and drop this folder to the Netlify dashboard
3. Your site will be deployed automatically

### Deploy to Vercel
1. Install Vercel CLI: \`npm install -g vercel\`
2. Run \`vercel\` in this directory
3. Follow the prompts to deploy
`,
    nextjs: `
## Deployment Instructions

### Deploy to Netlify
1. Create a new site in Netlify
2. Connect to your Git repository or drag and drop this folder
3. Build command: \`npm run build\`
4. Publish directory: \`out\`
5. Set environment variable \`NEXT_PUBLIC_SITE_URL\` to your site URL

### Deploy to Vercel
1. Install Vercel CLI: \`npm install -g vercel\`
2. Run \`vercel\` in this directory
3. Follow the prompts to deploy

### Local Development
1. Run \`npm install\` to install dependencies
2. Run \`npm run dev\` to start the development server
3. Open \`http://localhost:3000\` in your browser
`,
    react: `
## Deployment Instructions

### Deploy to Netlify
1. Create a new site in Netlify
2. Connect to your Git repository or drag and drop this folder
3. Build command: \`npm run build\`
4. Publish directory: \`dist\`

### Deploy to Vercel
1. Install Vercel CLI: \`npm install -g vercel\`
2. Run \`vercel\` in this directory
3. Follow the prompts to deploy

### Local Development
1. Run \`npm install\` to install dependencies
2. Run \`npm run dev\` to start the development server
3. Open \`http://localhost:5173\` in your browser
`,
    astro: `
## Deployment Instructions

### Deploy to Netlify
1. Create a new site in Netlify
2. Connect to your Git repository or drag and drop this folder
3. Build command: \`npm run build\`
4. Publish directory: \`dist\`

### Deploy to Vercel
1. Install Vercel CLI: \`npm install -g vercel\`
2. Run \`vercel\` in this directory
3. Follow the prompts to deploy

### Local Development
1. Run \`npm install\` to install dependencies
2. Run \`npm run dev\` to start the development server
3. Open \`http://localhost:3000\` in your browser
`
  };
  
  return `# ${siteName}

This website was created with Nexus Website Builder.

${formatInstructions[format as keyof typeof formatInstructions] || formatInstructions.html}

## License
Copyright © ${new Date().getFullYear()}. All rights reserved.
`;
}

// Generate HTML content
function generateHTMLContent(components: any[], siteName: string) {
  // Early return if no components
  if (!components || components.length === 0) {
    console.warn('No components found, generating a default page');
    return generateDefaultPage(siteName);
  }

  // Process the components to create actual HTML
  const componentHtml = components.map(component => {
    // Check the component type and generate appropriate HTML
    if (!component || !component.type) {
      return generateComponentHTML(component);
    }

    // Handle different component types
    switch(component.type.toLowerCase()) {
      case 'hero':
        return `
          <section class="hero">
            <h1>${component.props?.title || 'Welcome to ' + siteName}</h1>
            <p>${component.props?.subtitle || 'The best platform for your needs'}</p>
            ${component.props?.buttonText ? `<button class="btn">${component.props.buttonText}</button>` : ''}
          </section>
        `;
      case 'navbar':
        return `
          <nav class="navbar">
            <div class="logo">${component.props?.logo || siteName}</div>
            <ul class="nav-links">
              ${component.props?.links ? component.props.links.map((link: any) => 
                `<li><a href="${link.url || '#'}">${link.text || 'Link'}</a></li>`
              ).join('') : '<li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li>'}
            </ul>
          </nav>
        `;
      case 'footer':
        return `
          <footer class="footer">
            <div class="footer-content">
              ${component.props?.copyright || `&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
            </div>
          </footer>
        `;
      case 'content':
        return `
          <section class="content-section">
            <h2>${component.props?.title || 'Content Section'}</h2>
            <div class="content">
              ${component.props?.content || 'Your content goes here'}
            </div>
          </section>
        `;
      case 'features':
        return `
          <section class="features">
            <h2>${component.props?.title || 'Features'}</h2>
            <div class="features-grid">
              ${(component.props?.items || []).map((item: any) => `
                <div class="feature-item">
                  <h3>${item.title || 'Feature'}</h3>
                  <p>${item.description || 'Feature description'}</p>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      case 'contact':
        return `
          <section class="contact">
            <h2>${component.props?.title || 'Contact Us'}</h2>
            <div class="contact-content">
              ${component.props?.email ? `<p>Email: ${component.props.email}</p>` : ''}
              ${component.props?.phone ? `<p>Phone: ${component.props.phone}</p>` : ''}
              ${component.props?.address ? `<p>Address: ${component.props.address}</p>` : ''}
            </div>
          </section>
        `;
      default:
        return generateComponentHTML(component);
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${componentHtml}
    <script src="script.js"></script>
</body>
</html>`;
}

// Generate a default page if no components are available
function generateDefaultPage(siteName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${siteName}</h1>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h1>Welcome to ${siteName}</h1>
            <p>The best platform for your needs</p>
            <button class="btn">Get Started</button>
        </section>
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`;
}

// Generate CSS content
function generateCSSContent() {
  return `/* Base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}
header, .navbar {
    background: #f8f9fa;
    padding: 1rem 2rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}
nav ul, .nav-links {
    display: flex;
    list-style: none;
    justify-content: center;
    gap: 2rem;
}
nav ul li, .nav-links li {
    margin: 0;
}
nav ul li a, .nav-links li a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}
nav ul li a:hover, .nav-links li a:hover {
    color: #007bff;
}
.logo {
    font-weight: bold;
    font-size: 1.5rem;
}
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}
.hero {
    text-align: center;
    padding: 6rem 2rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    margin-bottom: 2rem;
}
.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
}
.hero p {
    font-size: 1.5rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}
.btn {
    padding: 1rem 2rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}
.btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}
.content-section {
    margin-bottom: 4rem;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}
.content-section h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
}
.features {
    padding: 4rem 2rem;
    background: #f8f9fa;
}
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
.feature-item {
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
}
.feature-item:hover {
    transform: translateY(-5px);
}
.contact {
    padding: 4rem 2rem;
    background: white;
    text-align: center;
}
.contact-content {
    max-width: 600px;
    margin: 0 auto;
    font-size: 1.1rem;
}
footer, .footer {
    text-align: center;
    padding: 3rem 2rem;
    background: #1a1a1a;
    color: white;
    margin-top: 4rem;
}
.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }
    .hero p {
        font-size: 1.2rem;
    }
    .features-grid {
        grid-template-columns: 1fr;
    }
    nav ul, .nav-links {
        flex-direction: column;
        gap: 1rem;
    }
}`;
}

// Generate JS content
function generateJSContent() {
  return `// JavaScript for the website
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add button animations
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        button.addEventListener('click', function() {
            this.style.transform = 'translateY(1px)';
            setTimeout(() => {
                this.style.transform = 'translateY(0)';
            }, 100);
        });
    });

    // Add scroll animations
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
});`;
}

// Generate HTML for a component
function generateComponentHTML(component: any) {
  if (!component) return '';
  
  const title = component.title || component.name || 'Component';
  const content = component.content || component.text || component.description || 'Content goes here';
  
  return `<div class="component">
    <h2>${title}</h2>
    <p>${content}</p>
  </div>`;
}

// Generate a random ID for the site
function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}
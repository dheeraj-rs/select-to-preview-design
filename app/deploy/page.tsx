"use client"
"use client"

// File: pages/deploy.tsx
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';

interface DeploymentStatus {
  status: 'idle' | 'checking' | 'deploying' | 'success' | 'error';
  message?: string;
  url?: string;
  logs?: string[];
}

const NetlifyDeployPage = () => {
  const [token, setToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({ 
    status: 'idle',
    logs: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Log update utility function
  const addDeploymentLog = (log: string) => {
    setDeploymentStatus(prev => ({
      ...prev,
      logs: [...(prev.logs || []), log]
    }));
    console.log(log);
  };

  // Create a dummy website zip file in memory using JSZip
  const createDummyWebsiteZip = async () => {
    try {
      // Import JSZip dynamically (to avoid server-side issues in Next.js)
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add index.html to the zip
      zip.file("index.html", `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Successfully Deployed Website</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .hero {
              background-color: #4b6bfb;
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .timestamp {
              background-color: #e9ecef;
              padding: 10px;
              border-radius: 4px;
              font-family: monospace;
              margin: 20px 0;
            }
            footer {
              text-align: center;
              margin-top: 40px;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="hero">
            <h1>🚀 Successfully Deployed!</h1>
            <p>Your website is now live on Netlify</p>
          </div>
          <div class="content">
            <h2>Congratulations!</h2>
            <p>This website was deployed using the Netlify API via a single-click deployment from your application.</p>
            <p>You've successfully implemented programmatic deployment to Netlify!</p>
            
            <div class="timestamp">
              <p>Deployment timestamp: ${new Date().toLocaleString()}</p>
            </div>
            
            <h3>What's next?</h3>
            <p>You can enhance this feature by:</p>
            <ul>
              <li>Allowing users to customize this template</li>
              <li>Adding more pages and assets</li>
              <li>Implementing custom domain setup</li>
            </ul>
          </div>
          <footer>
            <p>© ${new Date().getFullYear()} - Deployed with Netlify API</p>
          </footer>
        </body>
        </html>
      `);
      
      // Add a CSS file
      zip.file("styles.css", `
        /* Additional styles could go here */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
      `);
      
      // Generate the zip file as a blob
      return await zip.generateAsync({ type: "blob" });
    } catch (error) {
      console.error('Error creating zip file:', error);
      throw new Error('Failed to create demo website files');
    }
  };

  // Check if the Netlify token is valid
  const validateToken = async () => {
    if (!token) return;
    
    setIsTokenValid(null);
    setDeploymentStatus({ 
      status: 'checking',
      logs: ['Verifying Netlify token...']
    });
    
    try {
      const response = await axios.get('https://api.netlify.com/api/v1/sites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setIsTokenValid(true);
        setDeploymentStatus({ 
          status: 'idle',
          message: 'Token verified! Ready to deploy.',
          logs: ['Token verified successfully.']
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsTokenValid(false);
      setDeploymentStatus({ 
        status: 'error',
        message: 'Invalid token. Please check your Netlify personal access token.',
        logs: ['Token validation failed. Please ensure your token is valid and has the necessary permissions.']
      });
    }
  };

  // Create a new site on Netlify
  const createNetlifySite = async () => {
    try {
      const siteName = `deploy-${Date.now()}`;
      addDeploymentLog(`Creating site: ${siteName}`);
      
      const response = await axios.post(
        'https://api.netlify.com/api/v1/sites',
        { 
          name: siteName,
          // Additional configuration options
          ssl: true,
          force_ssl: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      addDeploymentLog(`Site created: ${response.data.name} (${response.data.id})`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      addDeploymentLog(`Failed to create site: ${errorMessage}`);
      throw new Error(`Failed to create site: ${errorMessage}`);
    }
  };

  // Deploy the actual site using direct upload
  const deployToNetlifySite = async (siteId: string, zipBlob: Blob) => {
    try {
      addDeploymentLog(`Deploying to site ID: ${siteId} (file size: ${(zipBlob.size / 1024).toFixed(2)} KB)`);
      
      // Create a FormData object to send the zip file
      const formData = new FormData();
      formData.append('file', zipBlob, 'site.zip');
      
      // Deploy to Netlify API
      const response = await axios.post(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000, // 2 minute timeout for large uploads
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            if (percentCompleted % 20 === 0) { // Log every 20%
              addDeploymentLog(`Upload progress: ${percentCompleted}%`);
            }
          }
        }
      );
      
      // Wait for deployment to become ready
      const deploymentId = response.data.id;
      addDeploymentLog(`Deployment started with ID: ${deploymentId}`);
      const deploymentState = await waitForDeploymentReady(siteId, deploymentId);
      
      addDeploymentLog(`Deployment completed: ${deploymentState.state}`);
      return deploymentState;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      addDeploymentLog(`Error deploying site: ${errorMessage}`);
      throw new Error(`Deployment failed: ${errorMessage}`);
    }
  };

  // Function to wait for deployment to be ready
  const waitForDeploymentReady = async (siteId: string, deployId: string) => {
    addDeploymentLog(`Waiting for deployment ${deployId} to be ready...`);
    
    // Try for up to 3 minutes (36 attempts, 5 seconds apart)
    for (let i = 0; i < 36; i++) {
      try {
        const response = await axios.get(
          `https://api.netlify.com/api/v1/sites/${siteId}/deploys/${deployId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const deployment = response.data;
        
        // If the deployment is ready, return it
        if (deployment.state === 'ready') {
          addDeploymentLog('Deployment is ready!');
          return deployment;
        }
        
        // If there's an error, throw it
        if (deployment.state === 'error') {
          addDeploymentLog(`Deployment failed: ${deployment.error_message || 'Unknown error'}`);
          throw new Error(`Deployment failed: ${deployment.error_message || 'Unknown error'}`);
        }
        
        // Otherwise, wait 5 seconds and try again
        if (i % 3 === 0) { // Only log every 15 seconds to reduce noise
          addDeploymentLog(`Deployment state: ${deployment.state}, waiting...`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        addDeploymentLog(`Error checking deployment status: ${errorMessage}`);
        throw new Error(`Failed to check deployment status: ${errorMessage}`);
      }
    }
    
    // If we've tried 36 times and it's still not ready, throw an error
    throw new Error('Deployment timed out after 3 minutes. Please check your Netlify dashboard.');
  };

  // Main deploy function with improved error handling
  const deployToNetlify = async () => {
    if (!token || !isTokenValid) {
      setDeploymentStatus({ 
        status: 'error',
        message: 'Please provide a valid Netlify personal access token.',
        logs: ['Deployment failed: No valid token provided.']
      });
      return;
    }
    
    setDeploymentStatus({ 
      status: 'deploying',
      message: 'Deploying your website to Netlify...',
      logs: ['Starting demo deployment process...']
    });

    try {
      // Create zip file
      addDeploymentLog('Creating dummy website ZIP...');
      const zipBlob = await createDummyWebsiteZip();
      addDeploymentLog(`ZIP created, size: ${(zipBlob.size / 1024).toFixed(2)} KB`);
      
      if (zipBlob.size === 0) {
        throw new Error('Created ZIP file is empty. Please try again.');
      }
      
      // Create a new site on Netlify
      addDeploymentLog('Creating new Netlify site...');
      const site = await createNetlifySite();
      const siteId = site.id;
      
      if (!siteId) {
        throw new Error('Failed to get a valid site ID from Netlify');
      }
      
      // Deploy the zip file to the site
      addDeploymentLog('Starting deployment...');
      const deployment = await deployToNetlifySite(siteId, zipBlob);
      
      // Get the deploy URL - preferring SSL URL
      const deployUrl = deployment.ssl_url || 
                       deployment.url || 
                       `https://${site.name}.netlify.app`;
      
      addDeploymentLog(`Deployment complete! URL: ${deployUrl}`);
      
      setDeploymentStatus({
        status: 'success',
        message: 'Your website has been successfully deployed!',
        url: deployUrl,
        logs: [...(deploymentStatus.logs || []), `Final deployment URL: ${deployUrl}`]
      });
    } catch (error) {
      addDeploymentLog(`Deployment process error: ${error.message}`);
      setDeploymentStatus({
        status: 'error',
        message: `Deployment failed: ${error.message}`,
        logs: [...(deploymentStatus.logs || []), `Deployment failed: ${error.message}`]
      });
    }
  };

  // Helper function to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle folder upload - IMPROVED VERSION
  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !isTokenValid) {
      setDeploymentStatus({ 
        status: 'error',
        message: 'Please provide a valid Netlify personal access token first.',
        logs: ['Deployment failed: No valid token provided.']
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) {
      addDeploymentLog('No files selected for upload');
      return;
    }

    setIsUploading(true);
    setDeploymentStatus({ 
      status: 'deploying',
      message: 'Uploading and deploying your folder to Netlify...',
      logs: [`Processing ${files.length} files from folder`]
    });

    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Process files in batches to avoid memory issues with large folders
      const BATCH_SIZE = 50;
      const filesToProcess = Array.from(files);
      let processedCount = 0;
      let hasIndexHtml = false;
      
      // Function to process a batch of files
      const processBatch = async (batch: File[]) => {
        for (const file of batch) {
          // Get proper path - handle webkitRelativePath or fallback
          const relativePath = file.webkitRelativePath || file.name;
          // Clean up path to ensure proper structure 
          // (remove any leading slashes or extra subdirectories)
          const cleanPath = relativePath.replace(/^\/+/, '');
          
          addDeploymentLog(`Processing file (${++processedCount}/${files.length}): ${cleanPath}`);
          
          // Check if we have an index.html file
          if (cleanPath.endsWith('index.html') || cleanPath === 'index.html') {
            hasIndexHtml = true;
          }
          
          try {
            // Read the file content
            const fileContent = await readFileAsArrayBuffer(file);
            zip.file(cleanPath, fileContent);
          } catch (error) {
            addDeploymentLog(`Warning: Failed to process file ${cleanPath}: ${error.message}`);
            // Continue with other files instead of failing completely
          }
        }
      };
      
      // Process files in batches
      for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
        const batch = filesToProcess.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
        addDeploymentLog(`Processed ${Math.min(i + BATCH_SIZE, filesToProcess.length)} of ${filesToProcess.length} files`);
      }
      
      // If no index.html, add a simple one
      if (!hasIndexHtml) {
        addDeploymentLog('No index.html found, adding a default one');
        zip.file("index.html", `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Deployed Website</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                line-height: 1.6;
              }
              .container { 
                background-color: #f8f9fa; 
                padding: 30px; 
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .timestamp {
                background-color: #e9ecef;
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your folder has been deployed!</h1>
                <p>This is a default index page created because no index.html was found in your upload.</p>
              </div>
              
              <p>Your website content has been successfully deployed to Netlify. 
              You can replace this page by adding an index.html file to your project.</p>
              
              <div class="timestamp">
                <p>Deploy timestamp: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
      
      // Generate the zip file
      addDeploymentLog('Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6 // Balance between size and speed
        }
      });
      addDeploymentLog(`ZIP created, size: ${(zipBlob.size / 1024).toFixed(2)} KB`);
      
      if (zipBlob.size === 0) {
        throw new Error('Generated ZIP file is empty. Please try again with different files.');
      }
      
      // Create a new site on Netlify
      addDeploymentLog('Creating new Netlify site...');
      const site = await createNetlifySite();
      const siteId = site.id;
      
      // Deploy the zip to the site
      addDeploymentLog('Starting deployment to Netlify...');
      const deployment = await deployToNetlifySite(siteId, zipBlob);
      
      // Get the deploy URL
      const deployUrl = deployment.ssl_url || deployment.url || `https://${site.name}.netlify.app`;
      addDeploymentLog(`Deployment complete! URL: ${deployUrl}`);
      
      setDeploymentStatus({
        status: 'success',
        message: 'Your website has been successfully deployed!',
        url: deployUrl,
        logs: [...(deploymentStatus.logs || []), `Final deployment URL: ${deployUrl}`]
      });
    } catch (error) {
      addDeploymentLog(`Folder upload and deployment error: ${error.message}`);
      setDeploymentStatus({
        status: 'error',
        message: `Deployment failed: ${error.message}`,
        logs: [...(deploymentStatus.logs || []), `Deployment failed: ${error.message}`]
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file upload for single files or multiple files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !isTokenValid) {
      setDeploymentStatus({ 
        status: 'error',
        message: 'Please provide a valid Netlify personal access token first.',
        logs: ['Deployment failed: No valid token provided.']
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) {
      addDeploymentLog('No files selected for upload');
      return;
    }

    setIsUploading(true);
    setDeploymentStatus({ 
      status: 'deploying',
      message: 'Uploading and deploying your files to Netlify...',
      logs: [`Processing ${files.length} files for upload`]
    });

    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      let hasIndex = false;
      
      // Add all selected files to the zip
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.webkitRelativePath || file.name;
        addDeploymentLog(`Adding file: ${fileName}`);
        
        // Check for index.html
        if (fileName.toLowerCase() === 'index.html') {
          hasIndex = true;
        }
        
        // Read the file content
        try {
          const fileContent = await readFileAsArrayBuffer(file);
          zip.file(fileName, fileContent);
        } catch (error) {
          addDeploymentLog(`Warning: Failed to process file ${fileName}: ${error.message}`);
          // Continue with other files
        }
      }
      
      // Always add an index.html if none exists
      if (!hasIndex) {
        addDeploymentLog('Adding default index.html');
        zip.file("index.html", `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Deployed Website</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                line-height: 1.6;
              }
              .container { 
                background-color: #f8f9fa; 
                padding: 30px; 
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .timestamp {
                background-color: #e9ecef;
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                margin: 20px 0;
              }
              .file-list {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your files have been deployed!</h1>
                <p>This is a default index page created because no index.html was found in your upload.</p>
              </div>
              
              <p>Your website content has been successfully deployed to Netlify.
              You uploaded ${files.length} file(s) to this site.</p>
              
              <div class="timestamp">
                <p>Deploy timestamp: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
      
      // Generate the zip file
      addDeploymentLog('Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE" 
      });
      addDeploymentLog(`ZIP created, size: ${(zipBlob.size / 1024).toFixed(2)} KB`);
      
      if (zipBlob.size === 0) {
        throw new Error('Generated ZIP file is empty. Please try again with different files.');
      }
      
      // Create a new site on Netlify
      addDeploymentLog('Creating new Netlify site...');
      const site = await createNetlifySite();
      const siteId = site.id;
      
      // Deploy the zip to the site
      addDeploymentLog('Starting deployment to Netlify...');
      const deployment = await deployToNetlifySite(siteId, zipBlob);
      
      // Get the deploy URL
      const deployUrl = deployment.ssl_url || deployment.url || `https://${site.name}.netlify.app`;
      addDeploymentLog(`Deployment complete! URL: ${deployUrl}`);
      
      setDeploymentStatus({
        status: 'success',
        message: 'Your website has been successfully deployed!',
        url: deployUrl,
        logs: [...(deploymentStatus.logs || []), `Final deployment URL: ${deployUrl}`]
      });
    } catch (error) {
      addDeploymentLog(`File upload and deployment error: ${error.message}`);
      setDeploymentStatus({
        status: 'error',
        message: `Deployment failed: ${error.message}`,
        logs: [...(deploymentStatus.logs || []), `Deployment failed: ${error.message}`]
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    // When token changes, reset validation state
    if (token) {
      setIsTokenValid(null);
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  // Status badge styles based on current state
  const getStatusBadgeStyle = () => {
    switch (deploymentStatus.status) {
      case 'checking':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Head>
        <title>Netlify One-Click Deploy</title>
        <meta name="description" content="Deploy a website to Netlify with one click" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Netlify One-Click Deploy</h1>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Netlify Personal Access Token
              </label>
              <div className="flex">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter your Netlify personal access token"
                />
                <button
                  onClick={validateToken}
                  disabled={!token || deploymentStatus.status === 'checking'}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                  {deploymentStatus.status === 'checking' ? 'Checking...' : 'Verify'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Get your token from{' '}
                <a
                  href="https://app.netlify.com/user/applications#personal-access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Netlify Access Tokens
                </a>
              </p>
            </div>

            {deploymentStatus.message && (
              <div className={`p-3 rounded-md mb-6 ${getStatusBadgeStyle()}`}>
                <p className="font-medium">{deploymentStatus.message}</p>
                {deploymentStatus.url && (
                  <p className="mt-2">
                    View your site:{' '}
                    <a
                      href={deploymentStatus.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      {deploymentStatus.url}
                    </a>
                  </p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Deploy Demo Website</h2>
                <p className="text-sm text-gray-600 mb-4">
                  This will create and deploy a simple demo website showing your deployment was successful.
                </p>
                <button
                  onClick={deployToNetlify}
                  disabled={!isTokenValid || isUploading || deploymentStatus.status === 'deploying'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {deploymentStatus.status === 'deploying' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deploying...
                    </span>
                  ) : (
                    'Deploy to Netlify'
                  )}
                </button>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Upload Your Website</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your website files or an entire folder for deployment.
                </p>
                
                <div className="space-y-2">
                  {/* Input for individual files */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isTokenValid || deploymentStatus.status === 'deploying'}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    Select Individual Files
                  </button>
                  
                  {/* Input for folder */}
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderUpload}
                    multiple
                    className="hidden"
                    webkitdirectory=""
                    directory=""
                  />
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    disabled={!isTokenValid || deploymentStatus.status === 'deploying'}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    Select Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">How This Integration Works</h2>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Enter your Netlify personal access token and verify it</li>
              <li>The system creates a new site on your Netlify account</li>
              <li>Website files are packaged into a deployable ZIP format</li>
              <li>Files are uploaded to Netlify using their Deploy API</li>
              <li>The system waits for the deployment to be ready</li>
              <li>Once deployed, a live URL is generated for your site</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> This implementation uses the actual Netlify API to perform deployments.
                In your website builder application, you'll want to integrate this functionality into your main 
                UI to provide users with a seamless deployment experience.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
              <p className="text-sm">
                <strong>Troubleshooting:</strong> If you see "Site not found" errors after deployment:
                <ul className="list-disc pl-5 mt-2">
                  <li>The deployment may still be processing - check the Netlify dashboard</li>
                  <li>Ensure your ZIP file contains an index.html at the root level</li>
                  <li>Wait a minute for DNS to propagate and try refreshing</li>
                  <li>Verify your token has full deploy permissions (not read-only)</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NetlifyDeployPage;

/* 
To use this component, you need to install these packages:
npm install axios jszip

And add the following type declarations to appease TypeScript:
// In a .d.ts file or at the top of this file:
declare module 'jszip';
*/
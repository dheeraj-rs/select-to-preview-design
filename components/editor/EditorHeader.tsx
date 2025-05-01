"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Save, Download, MonitorSmartphone, Smartphone, Tablet, 
  Laptop, ArrowLeft, Layers, ChevronDown, Rocket, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useWebsiteStore } from '@/lib/website-store';
import { useToast } from '@/hooks/use-toast';
import { deployToNetlify } from '@/lib/deploy-utils';
import { exportAsHTML, exportAsNextJS, exportAsAstro, generateSiteOutputFolder } from '@/lib/export-utils';

interface EditorHeaderProps {
  projectId: string;
  onSave?: () => void;
}

const EditorHeader = ({ projectId, onSave }: EditorHeaderProps) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [deploymentCompleted, setDeploymentCompleted] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { toast } = useToast();
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [netlifyToken, setNetlifyToken] = useState(
    process.env.NEXT_PUBLIC_NETLIFY_TOKEN || ''
  );
  const [selectedExportFormat, setSelectedExportFormat] = useState<'html' | 'nextjs' | 'astro'>('html');

  const currentWebsite = useWebsiteStore((state) => state.currentWebsite);
  const updateWebsite = useWebsiteStore((state) => state.updateWebsite);

  const handleDeploy = async () => {
    if (!currentWebsite) {
      toast({
        title: 'Deployment Failed',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    if (!siteName.match(/^[a-z0-9-]+$/)) {
      toast({
        title: 'Invalid Site Name',
        description: 'Site name can only contain lowercase letters, numbers, and hyphens',
        variant: 'destructive',
      });
      return;
    }

    const isDemo = !netlifyToken;
    if (!isDemo && (!netlifyToken.startsWith('netlifytoken_') || netlifyToken.length < 50)) {
      toast({
        title: 'Invalid Netlify Token',
        description: 'Please provide a valid Netlify personal access token',
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentError(null);
    
    try {
      toast({
        title: 'Deployment Started',
        description: isDemo ? 'Running demo deployment...' : 'Deploying to Netlify...',
      });

      const result = await deployToNetlify({
        website: currentWebsite,
        siteName,
        token: netlifyToken,
        isDemo
      });

      if (result.success && result.deploymentUrl) {
        setDeploymentUrl(result.deploymentUrl);
        setDeploymentCompleted(true);
        
        updateWebsite(currentWebsite.id, {
          deploymentUrl: result.deploymentUrl,
        });

        toast({
          title: 'Deployment Successful',
          description: 'Your website has been deployed!',
        });
      } else {
        throw new Error(result.error || 'Deployment failed with unknown error');
      }

      if (result.previewUrl) {
        updateWebsite(currentWebsite.id, {
          previewUrl: result.previewUrl,
        });
      }
    } catch (error) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid Netlify token. Please check your token and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Deployment timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setDeploymentError(errorMessage);
      toast({
        title: 'Deployment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleExport = async () => {
    if (!currentWebsite) {
      toast({
        title: 'Export Failed',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      let exportFunction;
      switch (selectedExportFormat) {
        case 'html':
          exportFunction = exportAsHTML;
          break;
        case 'nextjs':
          exportFunction = exportAsNextJS;
          break;
        case 'astro':
          exportFunction = exportAsAstro;
          break;
      }

      await exportFunction(currentWebsite);
      setExportDialogOpen(false);
      toast({
        title: 'Export Successful',
        description: `Website exported as ${selectedExportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle clipboard and URL opening safely
  const handleCopyUrl = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl);
      toast({
        title: "URL Copied",
        description: "The site URL has been copied to your clipboard."
      });
    }
  };

  const handleOpenUrl = () => {
    if (deploymentUrl) {
      window.open(deploymentUrl, '_blank');
    }
  };

  const handleDownloadSiteFiles = async () => {
    if (!currentWebsite) {
      toast({
        title: 'Download Failed',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Preparing Files',
        description: 'Generating your website files...',
      });

      await generateSiteOutputFolder(currentWebsite);
      
      toast({
        title: 'Files Ready',
        description: 'Your Netlify-ready website files have been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <Layers className="h-5 w-5 text-primary" />
            <span>Nexus</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Mode Buttons */}
          <div className="hidden md:flex border rounded-md overflow-hidden">
            <Button 
              variant={previewMode === 'desktop' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setPreviewMode('desktop')}
            >
              <Laptop className="h-4 w-4" />
            </Button>
            <Button 
              variant={previewMode === 'tablet' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button 
              variant={previewMode === 'mobile' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-none"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Save Button */}
          {onSave && (
            <Button variant="outline" size="sm" className="hidden md:flex gap-2" onClick={onSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}

          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                Export as...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Publish Button */}
          <Button 
            size="sm" 
            className="hidden md:flex gap-2" 
            onClick={() => setDeployDialogOpen(true)}
          >
            <Rocket className="h-4 w-4" />
            Publish
          </Button>

          {/* Mobile Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <MonitorSmartphone className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Your Website</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Tabs 
              value={selectedExportFormat} 
              onValueChange={(value) => setSelectedExportFormat(value as 'html' | 'nextjs' | 'astro')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                <TabsTrigger value="astro">Astro</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select the format that best suits your needs. Your website will be exported with all necessary files.
                </p>
                <Button onClick={handleExport} className="w-full">
                  Export Website
                </Button>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deploy Dialog */}
      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Your Website</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!deploymentCompleted ? (
              <>
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-1">Site Name</label>
                  <Input 
                    placeholder="my-awesome-website" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    disabled={isDeploying}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your site will be available at: https://{siteName || '[site-name]'}.netlify.app
                  </p>
                </div>

                {deploymentError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                    {deploymentError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button 
                    variant="outline"
                    onClick={handleDownloadSiteFiles}
                    disabled={isDeploying}
                  >
                    <span className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Files
                    </span>
                  </Button>
                  
                  <Button 
                    onClick={handleDeploy} 
                    disabled={isDeploying}
                  >
                    {isDeploying ? (
                      <span className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 animate-spin" />
                        Deploying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Deploy to Netlify
                      </span>
                    )}
                  </Button>
                </div>
                
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Deployment Options:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Download files and manually upload to Netlify</li>
                    <li>Deploy directly to Netlify with your account</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="rounded-full bg-green-100 p-3 inline-flex mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Deployment Successful!</h3>
                {deploymentUrl && (
                  <div className="bg-muted p-3 rounded-md flex items-center justify-between mb-4">
                    <span className="text-sm font-medium truncate">{deploymentUrl}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleOpenUrl}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <Button onClick={() => setDeployDialogOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default EditorHeader; 
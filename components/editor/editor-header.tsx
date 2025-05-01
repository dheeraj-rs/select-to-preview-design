"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Save, Download, Upload, Share, MonitorSmartphone, Smartphone, Tablet, 
  Laptop, ArrowLeft, Layers, ChevronDown, Rocket, ExternalLink, Info, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useWebsiteStore } from '@/lib/website-store';
import { useToast } from '@/hooks/use-toast';
import { deployToNetlify } from '@/lib/deploy-utils';
import { supabase } from '@/lib/supabase';

interface EditorHeaderProps {
  projectId: string;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ projectId }) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [netlifyToken, setNetlifyToken] = useState('');
  const [useRealDeployment, setUseRealDeployment] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentMessage, setDeploymentMessage] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [deploymentCompleted, setDeploymentCompleted] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const { components, exportFormat, setExportFormat } = useWebsiteStore();
  const { toast } = useToast();
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  // Reset deployment state when dialog closes
  useEffect(() => {
    if (!deployDialogOpen) {
      setTimeout(() => {
        if (!deployDialogOpen) {
          setDeploymentProgress(0);
          setDeploymentMessage('');
          setDeploymentCompleted(false);
          // Don't reset URL or token
        }
      }, 300);
    }
  }, [deployDialogOpen]);

  const handleExport = (type: string) => {
    toast({
      title: "Export Initiated",
      description: `Your website is being exported as ${type}. The download will start shortly.`,
    });
    setExportDialogOpen(false);
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);

      // Validate site name if provided
      if (siteName && !/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(siteName)) {
        throw new Error('Site name must contain only lowercase letters, numbers, and hyphens');
      }

      // Get token from environment variable
      const netlifyToken = process.env.NEXT_PUBLIC_NETLIFY_TOKEN;

      // Validate environment token
      if (!netlifyToken) {
        throw new Error('Netlify token not found in environment variables. Please check your .env file.');
      }

      const result = await deployToNetlify(projectId, siteName, {
        netlifyToken,
        showProgress: true
      });

      if (result.success) {
        setDeploymentUrl(result.url);
        toast({
          title: "Deployment Successful",
          description: `Your website is now live at ${result.url}`
        });
        // Save deployment to history
        await saveDeploymentToHistory(result);
      } else {
        throw new Error(result.error || 'Deployment failed');
      }

    } catch (error: any) {
      console.error('Deployment error:', error);
      setDeploymentError(error.message);
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: error.message
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const saveDeploymentToHistory = async (deploymentInfo: any) => {
    try {
      await supabase.from('deployments').insert({
        project_id: projectId,
        site_name: deploymentInfo.siteName,
        url: deploymentInfo.url,
        deploy_time: new Date().toISOString(),
        is_demo: false
      });
    } catch (error) {
      console.error('Failed to save deployment history:', error);
    }
  };

  // Opens the HTML preview in a new tab
  const openHtmlPreview = () => {
    if (htmlPreview) {
      const blob = new Blob([htmlPreview], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
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
          <Button variant="outline" size="sm" className="hidden md:flex gap-2" onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
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
          <Button 
            size="sm" 
            className="hidden md:flex gap-2" 
            onClick={() => setDeployDialogOpen(true)}
          >
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MonitorSmartphone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onSave}>
            <Save className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Download className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                Export as...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setDeployDialogOpen(true)}>
            <Rocket className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Your Website</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="nextjs" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              <TabsTrigger value="astro">Astro</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="nextjs" className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Export your website as a complete Next.js project. This includes all components, 
                styles, and configurations needed to run your site.
              </p>
              <Button onClick={() => handleExport('Next.js project')} className="w-full">
                Download Next.js Project
              </Button>
            </TabsContent>
            <TabsContent value="astro" className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Export your website as an Astro project. This includes all components,
                styles, and configurations needed to run your site.
              </p>
              <Button onClick={() => handleExport('Astro project')} className="w-full">
                Download Astro Project
              </Button>
            </TabsContent>
            <TabsContent value="html" className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Export your website as a standalone HTML website with CSS and JavaScript.
                Perfect for simple hosting solutions.
              </p>
              <Button onClick={() => handleExport('HTML zip file')} className="w-full">
                Download HTML Website
              </Button>
            </TabsContent>
          </Tabs>
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
                <p className="text-sm text-muted-foreground mb-4">
                  Your website will be deployed and you'll receive a unique URL to share with others.
                </p>
                
                {/* Export Format Selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-1">Export Format</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'html' | 'nextjs' | 'react' | 'astro')}
                    disabled={isDeploying}
                  >
                    <option value="html">HTML</option>
                    <option value="nextjs">Next.js</option>
                    <option value="react">React</option>
                    <option value="astro">Astro</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the format that best suits your needs. Next.js is recommended for most cases.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-1">Site Name (Optional)</label>
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
                
                {/* Real deployment toggle */}
                <div className="flex items-start space-x-2 mb-4">
                  <Checkbox 
                    id="useRealDeployment" 
                    checked={useRealDeployment}
                    onCheckedChange={(checked) => setUseRealDeployment(checked === true)}
                    disabled={isDeploying}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="useRealDeployment"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Use Real Deployment (Creates an actual live URL)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, your site will be deployed to Netlify with a real public URL.
                    </p>
                  </div>
                </div>
                
                {/* Netlify token input (shown only when real deployment is selected) */}
                {useRealDeployment && (
                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-1">Netlify API Token</label>
                    <Input 
                      type="password"
                      placeholder="netlify_pat_..." 
                      value={netlifyToken}
                      onChange={(e) => setNetlifyToken(e.target.value)}
                      disabled={isDeploying}
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        <a 
                          href="https://app.netlify.com/user/applications#personal-access-tokens" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Generate a token
                        </a>
                        {' '}from your Netlify account to deploy.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-4 text-center">
                <div className="flex justify-center my-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">Deployment Successful!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your website has been successfully deployed and is now ready.
                </p>
                
                {/* URL display with copy button */}
                <div className="bg-muted p-3 rounded-md flex items-center justify-between mb-4">
                  <span className="text-sm font-medium truncate">
                    {deploymentUrl}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        navigator.clipboard.writeText(deploymentUrl);
                        toast({ title: "URL Copied", description: "The site URL has been copied to your clipboard." });
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(deploymentUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Preview button if HTML is available */}
                {htmlPreview && (
                  <Button variant="outline" onClick={openHtmlPreview} className="mb-4 w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    Preview Site
                  </Button>
                )}
                
                {/* Help text */}
                <div className="text-xs text-muted-foreground">
                  <span>Site package has been downloaded. You can use it to deploy to your own hosting.</span>
                </div>
              </div>
            )}
            
            {isDeploying && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{deploymentMessage}</span>
                  <span>{deploymentProgress}%</span>
                </div>
                <Progress value={deploymentProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            {deploymentCompleted ? (
              <Button
                onClick={() => setDeployDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            ) : (
              <Button 
                onClick={handleDeploy} 
                className="w-full"
                disabled={isDeploying}
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isDeploying ? 'Deploying...' : useRealDeployment ? 'Deploy to Netlify' : 'Create Deployment'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default EditorHeader;
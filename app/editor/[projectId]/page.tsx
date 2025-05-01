"use client";

import { useEffect, useState } from 'react';
import EditorHeader from '@/components/editor/EditorHeader';
import { useWebsiteStore } from '@/lib/website-store';
import { useToast } from '@/hooks/use-toast';

interface EditorPageProps {
  params: {
    projectId: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = params;
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const currentWebsite = useWebsiteStore((state) => state.currentWebsite);
  const setCurrentWebsite = useWebsiteStore((state) => state.setCurrentWebsite);

  useEffect(() => {
    // Initialize the current website if not set
    if (!currentWebsite) {
      setCurrentWebsite({
        id: projectId,
        name: 'New Website',
        description: 'A new website created with Nexus',
        pages: [{
          id: 'home',
          title: 'Home',
          slug: 'home',
          content: '<h1>Welcome to your new website</h1>',
          isPublished: true
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, [projectId, currentWebsite, setCurrentWebsite]);

  const handleSave = async () => {
    if (!currentWebsite) return;
    
    try {
      setIsSaving(true);
      // Add your save logic here
      toast({
        title: "Changes Saved",
        description: "Your website has been saved successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your changes. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentWebsite) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Initializing your website</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader 
        projectId={projectId}
        onSave={handleSave}
      />
      <main className="container mx-auto px-4 py-8">
        {/* Add your editor content here */}
        <div className="grid gap-6">
          <div className="p-6 bg-card rounded-lg shadow">
            <h1 className="text-2xl font-semibold mb-4">{currentWebsite.name}</h1>
            <p className="text-muted-foreground">{currentWebsite.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
} 
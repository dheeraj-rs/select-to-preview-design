"use client";

import { useState, useEffect } from 'react';
import EditorHeader from '@/components/editor/EditorHeader';
import { ComponentLibrary } from '@/components/editor/component-library';
import { PreviewPanel } from '@/components/editor/preview-panel';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { useToast } from '@/hooks/use-toast';
import { useWebsiteStore } from '@/lib/website-store';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function EditorPage() {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const { components, setComponents } = useWebsiteStore();
  const { saveValue, getValue } = useLocalStorage();

  // Load saved components on initial render
  useEffect(() => {
    const savedComponents = getValue('nexus-components');
    if (savedComponents) {
      try {
        const parsed = JSON.parse(savedComponents);
        setComponents(parsed);
        toast({
          title: "Project loaded",
          description: "Your saved project has been loaded successfully",
        });
      } catch (error) {
        console.error("Failed to parse saved components:", error);
      }
    }
  }, []);

  // Save project handler
  const handleSaveProject = () => {
    try {
      saveValue('nexus-components', JSON.stringify(components));
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "There was an error saving your project",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EditorHeader 
        projectId="default"
        onSave={handleSaveProject} 
      />
      <div className="flex-1 flex">
        <ComponentLibrary />
        <PreviewPanel 
          onSelectComponent={setSelectedComponent}
          selectedComponent={selectedComponent}
        />
        {selectedComponent && (
          <PropertiesPanel 
            componentId={selectedComponent} 
            onClose={() => setSelectedComponent(null)}
          />
        )}
      </div>
    </div>
  );
}
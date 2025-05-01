"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { componentLibrary, getComponentsByCategory } from '@/lib/component-library';
import { useWebsiteStore } from '@/lib/website-store';
import { useToast } from '@/hooks/use-toast';

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('navbar');
  const [components, setComponents] = useState(getComponentsByCategory(currentCategory));
  const addComponent = useWebsiteStore((state) => state.addComponent);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm) {
      setComponents(
        componentLibrary.filter((component) =>
          component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setComponents(getComponentsByCategory(currentCategory));
    }
  }, [searchTerm, currentCategory]);

  const handleAddComponent = (type: string) => {
    addComponent(type);
    toast({
      title: "Component added",
      description: "Drag to reposition or click to edit properties",
    });
  };

  return (
    <div className="w-64 border-r bg-card h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="navbar" className="flex-1 flex flex-col" onValueChange={setCurrentCategory}>
        <TabsList className="grid grid-cols-3 h-auto p-1 mx-4 mt-4">
          <TabsTrigger value="navbar" className="text-xs py-1.5">Navbar</TabsTrigger>
          <TabsTrigger value="hero" className="text-xs py-1.5">Hero</TabsTrigger>
          <TabsTrigger value="about" className="text-xs py-1.5">About</TabsTrigger>
        </TabsList>
        
        <TabsList className="grid grid-cols-3 h-auto p-1 mx-4 mt-2 mb-4">
          <TabsTrigger value="content" className="text-xs py-1.5">Content</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs py-1.5">Contact</TabsTrigger>
          <TabsTrigger value="footer" className="text-xs py-1.5">Footer</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 grid gap-3">
            {components.map((component) => (
              <div
                key={component.type}
                className="border rounded-md p-3 transition-all hover:shadow-sm cursor-pointer bg-background"
                onClick={() => handleAddComponent(component.type)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{component.label}</div>
                  <component.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{component.description}</p>
              </div>
            ))}
            {components.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No components found. Try a different search.
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
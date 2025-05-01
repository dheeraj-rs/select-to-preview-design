"use client";

import { useState, useRef } from 'react';
import { useWebsiteStore, ComponentPosition } from '@/lib/website-store';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Move, Edit, Trash2 } from 'lucide-react';
import {
  SimpleNavbar,
  CenteredNavbar,
  CenteredHero,
  SplitHero,
  AboutCards,
  AboutImageText,
  FeaturesGrid,
  Testimonials,
  ContactForm,
  ContactInfo,
  SimpleFooter,
  ExpandedFooter
} from '@/components/website-components';

interface PreviewPanelProps {
  onSelectComponent: (id: string | null) => void;
  selectedComponent: string | null;
}

export function PreviewPanel({ onSelectComponent, selectedComponent }: PreviewPanelProps) {
  const { components, reorderComponents, removeComponent } = useWebsiteStore();
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const scrollRef = useRef<HTMLDivElement>(null);

  const renderComponent = (component: ComponentPosition) => {
    switch (component.type) {
      case 'simple-navbar':
        return <SimpleNavbar {...component.props} />;
      case 'centered-navbar':
        return <CenteredNavbar {...component.props} />;
      case 'centered-hero':
        return <CenteredHero {...component.props} />;
      case 'split-hero':
        return <SplitHero {...component.props} />;
      case 'about-cards':
        return <AboutCards {...component.props} />;
      case 'about-image-text':
        return <AboutImageText {...component.props} />;
      case 'features-grid':
        return <FeaturesGrid {...component.props} />;
      case 'testimonials':
        return <Testimonials {...component.props} />;
      case 'contact-form':
        return <ContactForm {...component.props} />;
      case 'contact-info':
        return <ContactInfo {...component.props} />;
      case 'simple-footer':
        return <SimpleFooter {...component.props} />;
      case 'expanded-footer':
        return <ExpandedFooter {...component.props} />;
      default:
        return <div>Unknown component type: {component.type}</div>;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderComponents(result.source.index, result.destination.index);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-secondary/20">
      <div className="p-4 bg-card border-b flex justify-center">
        <div className="flex border rounded-md overflow-hidden">
          <Button 
            variant={previewMode === 'edit' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-none"
            onClick={() => setPreviewMode('edit')}
          >
            Edit Mode
          </Button>
          <Button 
            variant={previewMode === 'preview' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-none"
            onClick={() => setPreviewMode('preview')}
          >
            Preview Mode
          </Button>
        </div>
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center p-8 max-w-md">
              <h3 className="text-lg font-medium mb-2">Start Building Your Website</h3>
              <p className="text-muted-foreground mb-4">
                Select components from the library on the left and add them to your page.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" size="sm">
                  Add Your First Component
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="website-components">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-full"
                  >
                    {components.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                        isDragDisabled={previewMode === 'preview'}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative ${selectedComponent === component.id ? 'ring-2 ring-primary ring-inset' : ''}`}
                          >
                            {previewMode === 'edit' && (
                              <div className="absolute top-2 right-2 z-10 flex bg-background border rounded-md shadow-sm overflow-hidden">
                                <div {...provided.dragHandleProps} className="p-1 hover:bg-secondary cursor-move">
                                  <Move className="h-4 w-4" />
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => onSelectComponent(component.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => removeComponent(component.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {renderComponent(component)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
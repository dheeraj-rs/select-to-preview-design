"use client";

import { useState, useEffect } from 'react';
import { useWebsiteStore } from '@/lib/website-store';
import { getComponentByType } from '@/lib/component-library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { X, ChevronDown, ChevronUp, Pencil, Plus, Trash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PropertiesPanelProps {
  componentId: string;
  onClose: () => void;
}

export function PropertiesPanel({ componentId, onClose }: PropertiesPanelProps) {
  const { components, updateComponent } = useWebsiteStore();
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    content: true,
    style: false,
    advanced: false,
  });
  
  const component = components.find(c => c.id === componentId);
  
  useEffect(() => {
    if (component) {
      setLocalProps(component.props);
    }
  }, [component]);
  
  if (!component) return null;
  
  const componentTemplate = getComponentByType(component.type);
  
  const handleChange = (key: string, value: any) => {
    setLocalProps(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const applyChanges = () => {
    updateComponent(componentId, localProps);
  };
  
  const handleNestedChange = (key: string, index: number, nestedKey: string, value: any) => {
    const newArray = [...localProps[key]];
    newArray[index] = {
      ...newArray[index],
      [nestedKey]: value,
    };
    
    handleChange(key, newArray);
  };
  
  const addArrayItem = (key: string, template: any) => {
    const newArray = [...localProps[key], {...template}];
    handleChange(key, newArray);
  };
  
  const removeArrayItem = (key: string, index: number) => {
    const newArray = [...localProps[key]];
    newArray.splice(index, 1);
    handleChange(key, newArray);
  };
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  return (
    <div className="w-80 border-l bg-card h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Edit Component</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Component Type */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground">COMPONENT TYPE</Label>
            <div className="font-medium">{componentTemplate?.label || component.type}</div>
          </div>
          
          <Separator className="my-4" />
          
          {/* General Properties */}
          <Collapsible
            open={openSections.general}
            onOpenChange={() => toggleSection('general')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="text-sm font-medium">General</h3>
                {openSections.general ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              {component.type.includes('navbar') && (
                <>
                  <div>
                    <Label htmlFor="logo">Logo Text</Label>
                    <Input
                      id="logo"
                      value={localProps.logo || ''}
                      onChange={(e) => handleChange('logo', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                  
                  {component.type === 'simple-navbar' && (
                    <div>
                      <Label>Navigation Links</Label>
                      {localProps.links && localProps.links.map((link: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mt-2">
                          <Input
                            value={link.label}
                            onChange={(e) => handleNestedChange('links', index, 'label', e.target.value)}
                            onBlur={applyChanges}
                            placeholder="Link text"
                            className="flex-1"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => handleNestedChange('links', index, 'url', e.target.value)}
                            onBlur={applyChanges}
                            placeholder="URL"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('links', index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => addArrayItem('links', { label: 'New Link', url: '#' })}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Link
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {component.type.includes('hero') && (
                <>
                  <div>
                    <Label htmlFor="heading">Heading</Label>
                    <Input
                      id="heading"
                      value={localProps.heading || ''}
                      onChange={(e) => handleChange('heading', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subheading">Subheading</Label>
                    <Textarea
                      id="subheading"
                      value={localProps.subheading || ''}
                      onChange={(e) => handleChange('subheading', e.target.value)}
                      onBlur={applyChanges}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={localProps.buttonText || ''}
                      onChange={(e) => handleChange('buttonText', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonUrl">Button URL</Label>
                    <Input
                      id="buttonUrl"
                      value={localProps.buttonUrl || ''}
                      onChange={(e) => handleChange('buttonUrl', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                </>
              )}
              
              {component.type.includes('about') && (
                <>
                  <div>
                    <Label htmlFor="heading">Heading</Label>
                    <Input
                      id="heading"
                      value={localProps.heading || ''}
                      onChange={(e) => handleChange('heading', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                  
                  {component.type === 'about-image-text' && (
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={localProps.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        onBlur={applyChanges}
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
              
              {component.type.includes('footer') && (
                <>
                  <div>
                    <Label htmlFor="logo">Logo Text</Label>
                    <Input
                      id="logo"
                      value={localProps.logo || ''}
                      onChange={(e) => handleChange('logo', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                  <div>
                    <Label htmlFor="copyright">Copyright Text</Label>
                    <Input
                      id="copyright"
                      value={localProps.copyright || ''}
                      onChange={(e) => handleChange('copyright', e.target.value)}
                      onBlur={applyChanges}
                    />
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Content Properties */}
          <Collapsible
            open={openSections.content}
            onOpenChange={() => toggleSection('content')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="text-sm font-medium">Content</h3>
                {openSections.content ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              {component.type === 'about-cards' && localProps.cards && (
                <div>
                  <Label>Cards</Label>
                  {localProps.cards.map((card: any, index: number) => (
                    <Collapsible key={index} className="mt-2 border rounded-md p-2">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span className="text-sm font-medium">{card.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={card.title}
                            onChange={(e) => handleNestedChange('cards', index, 'title', e.target.value)}
                            onBlur={applyChanges}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) => handleNestedChange('cards', index, 'description', e.target.value)}
                            onBlur={applyChanges}
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeArrayItem('cards', index)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Remove Card
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => addArrayItem('cards', { title: 'New Card', description: 'Card description', icon: 'Star' })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Card
                  </Button>
                </div>
              )}
              
              {component.type === 'features-grid' && localProps.features && (
                <div>
                  <Label>Features</Label>
                  {localProps.features.map((feature: any, index: number) => (
                    <Collapsible key={index} className="mt-2 border rounded-md p-2">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span className="text-sm font-medium">{feature.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => handleNestedChange('features', index, 'title', e.target.value)}
                            onBlur={applyChanges}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) => handleNestedChange('features', index, 'description', e.target.value)}
                            onBlur={applyChanges}
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeArrayItem('features', index)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Remove Feature
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => addArrayItem('features', { title: 'New Feature', description: 'Feature description', icon: 'Star' })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                  </Button>
                </div>
              )}
              
              {component.type === 'testimonials' && localProps.testimonials && (
                <div>
                  <Label>Testimonials</Label>
                  {localProps.testimonials.map((testimonial: any, index: number) => (
                    <Collapsible key={index} className="mt-2 border rounded-md p-2">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span className="text-sm font-medium">{testimonial.author}</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        <div>
                          <Label>Quote</Label>
                          <Textarea
                            value={testimonial.quote}
                            onChange={(e) => handleNestedChange('testimonials', index, 'quote', e.target.value)}
                            onBlur={applyChanges}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Author Name</Label>
                          <Input
                            value={testimonial.author}
                            onChange={(e) => handleNestedChange('testimonials', index, 'author', e.target.value)}
                            onBlur={applyChanges}
                          />
                        </div>
                        <div>
                          <Label>Author Title</Label>
                          <Input
                            value={testimonial.title}
                            onChange={(e) => handleNestedChange('testimonials', index, 'title', e.target.value)}
                            onBlur={applyChanges}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeArrayItem('testimonials', index)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Remove Testimonial
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => addArrayItem('testimonials', { 
                      quote: 'This is a great product!', 
                      author: 'New Customer', 
                      title: 'Customer',
                      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Style Properties */}
          <Collapsible
            open={openSections.style}
            onOpenChange={() => toggleSection('style')}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="text-sm font-medium">Style</h3>
                {openSections.style ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={localProps.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    onBlur={applyChanges}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={localProps.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    onBlur={applyChanges}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={localProps.textColor || '#000000'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    onBlur={applyChanges}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={localProps.textColor || '#000000'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    onBlur={applyChanges}
                    className="flex-1"
                  />
                </div>
              </div>
              
              {(component.type.includes('hero') || component.type.includes('about-image')) && (
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={localProps.image || ''}
                    onChange={(e) => handleChange('image', e.target.value)}
                    onBlur={applyChanges}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
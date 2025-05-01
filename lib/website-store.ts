"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { componentLibrary } from './component-library';

export type ComponentPosition = {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
};

export interface Website {
  id: string;
  name: string;
  description?: string;
  pages: WebsitePage[];
  createdAt: Date;
  updatedAt: Date;
  deploymentUrl?: string;
  previewUrl?: string;
}

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

interface WebsiteStore {
  currentWebsite: Website | null;
  websites: Website[];
  setCurrentWebsite: (website: Website) => void;
  addWebsite: (website: Website) => void;
  updateWebsite: (id: string, updates: Partial<Website>) => void;
  deleteWebsite: (id: string) => void;
  addPage: (websiteId: string, page: WebsitePage) => void;
  updatePage: (websiteId: string, pageId: string, updates: Partial<WebsitePage>) => void;
  deletePage: (websiteId: string, pageId: string) => void;
  components: ComponentPosition[];
  exportFormat: 'html' | 'nextjs' | 'react' | 'astro';
  setComponents: (components: ComponentPosition[]) => void;
  addComponent: (type: string) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  removeComponent: (id: string) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;
  setExportFormat: (format: 'html' | 'nextjs' | 'react' | 'astro') => void;
}

export const useWebsiteStore = create<WebsiteStore>()(
  persist(
    (set) => ({
      currentWebsite: null,
      websites: [],
      components: [],
      exportFormat: 'html',
      
      setCurrentWebsite: (website) => set({ currentWebsite: website }),
      
      addWebsite: (website) =>
        set((state) => ({
          websites: [...state.websites, website],
          currentWebsite: website,
        })),
      
      updateWebsite: (id, updates) =>
        set((state) => ({
          websites: state.websites.map((site) =>
            site.id === id ? { ...site, ...updates, updatedAt: new Date() } : site
          ),
          currentWebsite:
            state.currentWebsite?.id === id
              ? { ...state.currentWebsite, ...updates, updatedAt: new Date() }
              : state.currentWebsite,
        })),
      
      deleteWebsite: (id) =>
        set((state) => ({
          websites: state.websites.filter((site) => site.id !== id),
          currentWebsite:
            state.currentWebsite?.id === id ? null : state.currentWebsite,
        })),
      
      addPage: (websiteId, page) =>
        set((state) => ({
          websites: state.websites.map((site) =>
            site.id === websiteId
              ? {
                  ...site,
                  pages: [...site.pages, page],
                  updatedAt: new Date(),
                }
              : site
          ),
          currentWebsite:
            state.currentWebsite?.id === websiteId
              ? {
                  ...state.currentWebsite,
                  pages: [...state.currentWebsite.pages, page],
                  updatedAt: new Date(),
                }
              : state.currentWebsite,
        })),
      
      updatePage: (websiteId, pageId, updates) =>
        set((state) => ({
          websites: state.websites.map((site) =>
            site.id === websiteId
              ? {
                  ...site,
                  pages: site.pages.map((page) =>
                    page.id === pageId ? { ...page, ...updates } : page
                  ),
                  updatedAt: new Date(),
                }
              : site
          ),
          currentWebsite:
            state.currentWebsite?.id === websiteId
              ? {
                  ...state.currentWebsite,
                  pages: state.currentWebsite.pages.map((page) =>
                    page.id === pageId ? { ...page, ...updates } : page
                  ),
                  updatedAt: new Date(),
                }
              : state.currentWebsite,
        })),
      
      deletePage: (websiteId, pageId) =>
        set((state) => ({
          websites: state.websites.map((site) =>
            site.id === websiteId
              ? {
                  ...site,
                  pages: site.pages.filter((page) => page.id !== pageId),
                  updatedAt: new Date(),
                }
              : site
          ),
          currentWebsite:
            state.currentWebsite?.id === websiteId
              ? {
                  ...state.currentWebsite,
                  pages: state.currentWebsite.pages.filter(
                    (page) => page.id !== pageId
                  ),
                  updatedAt: new Date(),
                }
              : state.currentWebsite,
        })),
      
      setComponents: (components) => set({ components }),
      
      addComponent: (type) => set((state) => {
        const template = componentLibrary.find(c => c.type === type);
        if (!template) return state;
        
        const newComponent: ComponentPosition = {
          id: `${type}-${Date.now()}`,
          type,
          order: state.components.length,
          props: { ...template.defaultProps },
        };
        
        return { components: [...state.components, newComponent] };
      }),
      
      updateComponent: (id, props) => set((state) => ({
        components: state.components.map((component) => 
          component.id === id ? { ...component, props: { ...component.props, ...props } } : component
        ),
      })),
      
      removeComponent: (id) => set((state) => ({
        components: state.components
          .filter((component) => component.id !== id)
          .map((component, index) => ({ ...component, order: index })),
      })),
      
      reorderComponents: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.components);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        return {
          components: result.map((component, index) => ({
            ...component,
            order: index,
          })),
        };
      }),
      
      setExportFormat: (format) => set({ exportFormat: format }),
    }),
    {
      name: 'website-storage',
    }
  )
);
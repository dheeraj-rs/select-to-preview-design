import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layout, Code, Palette, Share2, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <Layers className="h-8 w-8 text-primary" />
          <span>Nexus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/editor" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/editor" className="hover:text-primary transition-colors">Templates</Link>
          <Link href="/editor" className="hover:text-primary transition-colors">Pricing</Link>
          <Button asChild variant="default">
            <Link href="/editor">
              Start Building
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl">
          Build Beautiful Websites <br /> Without Writing Code
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Nexus makes it easy to create stunning, professional websites
          using our intuitive drag-and-drop builder. No coding required.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="px-8 gap-2">
            <Link href="/editor">
              Start Building <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/editor">
              View Templates
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need to Create Your Website
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Layout />}
            title="Drag & Drop Builder"
            description="Arrange pre-built components to create your perfect website layout with our intuitive interface."
          />
          <FeatureCard 
            icon={<Palette />}
            title="Customizable Components"
            description="Easily customize colors, fonts, images, and content to match your brand's unique style."
          />
          <FeatureCard 
            icon={<Code />}
            title="Export Options"
            description="Download your site as a Next.js project, Astro project, or standalone HTML files."
          />
          <FeatureCard 
            icon={<Share2 />}
            title="One-Click Publishing"
            description="Deploy your website directly to Netlify with a single click and get a live URL instantly."
          />
          <FeatureCard 
            icon={<Layout />}
            title="Responsive Design"
            description="All components are fully responsive to ensure your website looks great on any device."
          />
          <FeatureCard 
            icon={<Layers />}
            title="Component Library"
            description="Choose from a rich library of pre-designed components organized by category."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Website?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Join thousands of users who have already built beautiful websites with Nexus.
            No coding skills required.
          </p>
          <Button asChild size="lg" className="px-8 gap-2">
            <Link href="/editor">
              Start Building Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Layers className="h-6 w-6 text-primary" />
            <span>Nexus</span>
          </div>
          <div className="flex gap-6">
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </Link>
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Nexus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-card shadow-sm rounded-lg p-6 border transition-all hover:shadow-md">
      <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
import { GanttChart, Grid3X3, Mail, Menu, Send, User, User2, UserCircle2 } from "lucide-react";

export type ComponentTemplate = {
  type: string;
  category: 'navbar' | 'hero' | 'about' | 'content' | 'contact' | 'footer';
  label: string;
  icon: any; // Lucide icon component
  description: string;
  defaultProps: Record<string, any>;
};

export const componentLibrary: ComponentTemplate[] = [
  // Navbar Components
  {
    type: 'simple-navbar',
    category: 'navbar',
    label: 'Simple Navbar',
    icon: Menu,
    description: 'A clean, minimal navigation bar with logo and links',
    defaultProps: {
      logo: 'My Website',
      links: [
        { label: 'Home', url: '#' },
        { label: 'Features', url: '#' },
        { label: 'Pricing', url: '#' },
        { label: 'Contact', url: '#' },
      ],
      buttonText: 'Sign Up',
      buttonUrl: '#',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },
  {
    type: 'centered-navbar',
    category: 'navbar',
    label: 'Centered Navbar',
    icon: Menu,
    description: 'Navigation bar with centered logo and links on both sides',
    defaultProps: {
      logo: 'My Website',
      leftLinks: [
        { label: 'Home', url: '#' },
        { label: 'Features', url: '#' },
      ],
      rightLinks: [
        { label: 'Pricing', url: '#' },
        { label: 'Contact', url: '#' },
      ],
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },

  // Hero Components
  {
    type: 'centered-hero',
    category: 'hero',
    label: 'Centered Hero',
    icon: Grid3X3,
    description: 'A centered hero section with heading, subheading, and CTA button',
    defaultProps: {
      heading: 'Welcome to My Website',
      subheading: 'The best platform for your needs',
      buttonText: 'Get Started',
      buttonUrl: '#',
      backgroundImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      overlayColor: 'rgba(0,0,0,0.5)',
      textColor: '#ffffff',
    },
  },
  {
    type: 'split-hero',
    category: 'hero',
    label: 'Split Hero',
    icon: Grid3X3,
    description: 'A hero section split into text and image',
    defaultProps: {
      heading: 'Welcome to My Website',
      subheading: 'The best platform for your needs',
      buttonText: 'Get Started',
      buttonUrl: '#',
      image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },

  // About Components
  {
    type: 'about-cards',
    category: 'about',
    label: 'About with Cards',
    icon: User,
    description: 'About section with multiple information cards',
    defaultProps: {
      heading: 'About Us',
      cards: [
        {
          title: 'Our Mission',
          description: 'We strive to provide the best service possible to our customers.',
          icon: 'Target',
        },
        {
          title: 'Our Vision',
          description: 'To become the leading provider in our industry.',
          icon: 'Eye',
        },
        {
          title: 'Our Values',
          description: 'Integrity, excellence, and innovation guide everything we do.',
          icon: 'Heart',
        },
      ],
      backgroundColor: '#f9fafb',
      textColor: '#111827',
    },
  },
  {
    type: 'about-image-text',
    category: 'about',
    label: 'About with Image',
    icon: User2,
    description: 'About section with image and text side by side',
    defaultProps: {
      heading: 'About Our Company',
      description: 'We are a forward-thinking company dedicated to excellence and innovation. Our team of experts works tirelessly to ensure we deliver the best products and services to our customers.',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },

  // Content Components
  {
    type: 'features-grid',
    category: 'content',
    label: 'Features Grid',
    icon: GanttChart,
    description: 'A grid layout showcasing features or services',
    defaultProps: {
      heading: 'Our Features',
      subheading: 'Everything you need to succeed',
      features: [
        {
          title: 'Feature 1',
          description: 'Description of feature 1',
          icon: 'Zap',
        },
        {
          title: 'Feature 2',
          description: 'Description of feature 2',
          icon: 'Shield',
        },
        {
          title: 'Feature 3',
          description: 'Description of feature 3',
          icon: 'Star',
        },
        {
          title: 'Feature 4',
          description: 'Description of feature 4',
          icon: 'Bell',
        },
      ],
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },
  {
    type: 'testimonials',
    category: 'content',
    label: 'Testimonials',
    icon: UserCircle2,
    description: 'Customer testimonials in a carousel',
    defaultProps: {
      heading: 'What Our Customers Say',
      testimonials: [
        {
          quote: 'This product has completely transformed our business operations.',
          author: 'Jane Doe',
          title: 'CEO, Company A',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        },
        {
          quote: 'I cannot imagine running my business without this tool anymore.',
          author: 'John Smith',
          title: 'Founder, Company B',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        },
      ],
      backgroundColor: '#f9fafb',
      textColor: '#111827',
    },
  },

  // Contact Components
  {
    type: 'contact-form',
    category: 'contact',
    label: 'Contact Form',
    icon: Mail,
    description: 'A simple contact form with fields for name, email, and message',
    defaultProps: {
      heading: 'Contact Us',
      subheading: 'We\'d love to hear from you',
      buttonText: 'Send Message',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },
  {
    type: 'contact-info',
    category: 'contact',
    label: 'Contact Information',
    icon: Send,
    description: 'Display contact information with map and details',
    defaultProps: {
      heading: 'Get in Touch',
      address: '123 Main St, City, Country',
      email: 'contact@example.com',
      phone: '+1 (555) 123-4567',
      mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQ1JzA1LjQiTiAwMMKwNDgnMDEuNyJX!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
    },
  },

  // Footer Components
  {
    type: 'simple-footer',
    category: 'footer',
    label: 'Simple Footer',
    icon: Menu,
    description: 'A simple footer with links and copyright',
    defaultProps: {
      logo: 'My Website',
      links: [
        { label: 'Home', url: '#' },
        { label: 'About', url: '#' },
        { label: 'Features', url: '#' },
        { label: 'Contact', url: '#' },
      ],
      copyright: '© 2025 My Website. All rights reserved.',
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
    },
  },
  {
    type: 'expanded-footer',
    category: 'footer',
    label: 'Expanded Footer',
    icon: Menu,
    description: 'An expanded footer with multiple sections of links',
    defaultProps: {
      logo: 'My Website',
      sections: [
        {
          title: 'Product',
          links: [
            { label: 'Features', url: '#' },
            { label: 'Pricing', url: '#' },
            { label: 'FAQ', url: '#' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', url: '#' },
            { label: 'Team', url: '#' },
            { label: 'Careers', url: '#' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Blog', url: '#' },
            { label: 'Support', url: '#' },
            { label: 'Contact', url: '#' },
          ],
        },
      ],
      copyright: '© 2025 My Website. All rights reserved.',
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
    },
  },
];

export const getComponentsByCategory = (category: string) => {
  return componentLibrary.filter(component => component.category === category);
};

export const getComponentByType = (type: string) => {
  return componentLibrary.find(component => component.type === type);
};
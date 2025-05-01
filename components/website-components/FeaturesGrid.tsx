import { Bell, Shield, Star, Zap } from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesGridProps {
  heading: string;
  subheading: string;
  features: FeatureProps[];
  backgroundColor: string;
  textColor: string;
}

export function FeaturesGrid({
  heading,
  subheading,
  features,
  backgroundColor,
  textColor,
}: FeaturesGridProps) {
  // Map strings to Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="h-8 w-8" />;
      case 'Shield':
        return <Shield className="h-8 w-8" />;
      case 'Star':
        return <Star className="h-8 w-8" />;
      case 'Bell':
        return <Bell className="h-8 w-8" />;
      default:
        return <Star className="h-8 w-8" />;
    }
  };

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          <p className="text-lg max-w-2xl mx-auto">{subheading}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-4">{getIcon(feature.icon)}</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                {feature.title}
              </h3>
              <p style={{ color: textColor }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
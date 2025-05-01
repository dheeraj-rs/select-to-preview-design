import { Circle, Heart, Target } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon: string;
}

interface AboutCardsProps {
  heading: string;
  cards: CardProps[];
  backgroundColor: string;
  textColor: string;
}

export function AboutCards({
  heading,
  cards,
  backgroundColor,
  textColor,
}: AboutCardsProps) {
  // Map strings to Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="h-12 w-12" />;
      case 'Heart':
        return <Heart className="h-12 w-12" />;
      case 'Eye':
        return <Circle className="h-12 w-12" />;
      default:
        return <Circle className="h-12 w-12" />;
    }
  };

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{heading}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-primary">{getIcon(card.icon)}</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                {card.title}
              </h3>
              <p style={{ color: textColor }}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
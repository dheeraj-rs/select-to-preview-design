import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CenteredHeroProps {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
  overlayColor: string;
  textColor: string;
}

export function CenteredHero({
  heading,
  subheading,
  buttonText,
  buttonUrl,
  backgroundImage,
  overlayColor,
  textColor,
}: CenteredHeroProps) {
  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor }}
      ></div>
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{heading}</h1>
        <p className="text-lg md:text-xl mb-8">{subheading}</p>
        <Button asChild size="lg" className="px-8">
          <Link href={buttonUrl}>
            {buttonText}
          </Link>
        </Button>
      </div>
    </div>
  );
}
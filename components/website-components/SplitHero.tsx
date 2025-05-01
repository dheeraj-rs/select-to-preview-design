import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SplitHeroProps {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

export function SplitHero({
  heading,
  subheading,
  buttonText,
  buttonUrl,
  image,
  backgroundColor,
  textColor,
}: SplitHeroProps) {
  return (
    <div
      className="w-full py-16 md:py-0 md:min-h-[600px] flex flex-col md:flex-row"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{heading}</h1>
          <p className="text-lg mb-8">{subheading}</p>
          <Button asChild size="lg">
            <Link href={buttonUrl}>
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
      <div className="w-full md:w-1/2 min-h-[300px] md:min-h-full">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      </div>
    </div>
  );
}
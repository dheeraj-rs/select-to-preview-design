import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavLinkProps {
  label: string;
  url: string;
}

interface SimpleNavbarProps {
  logo: string;
  links: NavLinkProps[];
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
  textColor: string;
}

export function SimpleNavbar({
  logo,
  links,
  buttonText,
  buttonUrl,
  backgroundColor,
  textColor,
}: SimpleNavbarProps) {
  return (
    <header
      style={{ backgroundColor, color: textColor }}
      className="w-full py-4 px-6"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="#" className="text-xl font-bold">
          {logo}
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              style={{ color: textColor }}
              className="hover:opacity-80 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={buttonUrl}>
            {buttonText}
          </Link>
        </Button>
      </div>
    </header>
  );
}
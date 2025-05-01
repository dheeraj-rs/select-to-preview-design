import Link from "next/link";

interface NavLinkProps {
  label: string;
  url: string;
}

interface CenteredNavbarProps {
  logo: string;
  leftLinks: NavLinkProps[];
  rightLinks: NavLinkProps[];
  backgroundColor: string;
  textColor: string;
}

export function CenteredNavbar({
  logo,
  leftLinks,
  rightLinks,
  backgroundColor,
  textColor,
}: CenteredNavbarProps) {
  return (
    <header
      style={{ backgroundColor, color: textColor }}
      className="w-full py-4 px-6"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-8">
          {leftLinks.map((link, index) => (
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
        
        <Link href="#" className="text-xl font-bold">
          {logo}
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {rightLinks.map((link, index) => (
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
      </div>
    </header>
  );
}
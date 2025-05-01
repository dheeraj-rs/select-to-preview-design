import Link from "next/link";

interface FooterLinkProps {
  label: string;
  url: string;
}

interface SimpleFooterProps {
  logo: string;
  links: FooterLinkProps[];
  copyright: string;
  backgroundColor: string;
  textColor: string;
}

export function SimpleFooter({
  logo,
  links,
  copyright,
  backgroundColor,
  textColor,
}: SimpleFooterProps) {
  return (
    <footer
      className="py-12 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <Link href="#" className="text-xl font-bold mb-4 md:mb-0">
            {logo}
          </Link>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className="hover:opacity-80 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
import Link from "next/link";

interface FooterLinkProps {
  label: string;
  url: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLinkProps[];
}

interface ExpandedFooterProps {
  logo: string;
  sections: FooterSectionProps[];
  copyright: string;
  backgroundColor: string;
  textColor: string;
}

export function ExpandedFooter({
  logo,
  sections,
  copyright,
  backgroundColor,
  textColor,
}: ExpandedFooterProps) {
  return (
    <footer
      className="py-12 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="#" className="text-xl font-bold block mb-4">
              {logo}
            </Link>
          </div>
          
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.url}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
interface AboutImageTextProps {
  heading: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

export function AboutImageText({
  heading,
  description,
  image,
  backgroundColor,
  textColor,
}: AboutImageTextProps) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <h2 className="text-3xl font-bold mb-6">{heading}</h2>
          <p className="text-lg leading-relaxed">{description}</p>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <img
            src={image}
            alt={heading}
            className="rounded-lg shadow-md w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
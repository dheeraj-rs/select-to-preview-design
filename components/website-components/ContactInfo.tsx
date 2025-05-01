interface ContactInfoProps {
  heading: string;
  address: string;
  email: string;
  phone: string;
  mapEmbed: string;
  backgroundColor: string;
  textColor: string;
}

export function ContactInfo({
  heading,
  address,
  email,
  phone,
  mapEmbed,
  backgroundColor,
  textColor,
}: ContactInfoProps) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: textColor }}>Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium" style={{ color: textColor }}>Address:</p>
                  <p style={{ color: textColor }}>{address}</p>
                </div>
                
                <div>
                  <p className="font-medium" style={{ color: textColor }}>Email:</p>
                  <p style={{ color: textColor }}>{email}</p>
                </div>
                
                <div>
                  <p className="font-medium" style={{ color: textColor }}>Phone:</p>
                  <p style={{ color: textColor }}>{phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-lg shadow-sm p-2 h-full">
              {/* Safely render the map iframe */}
              <div dangerouslySetInnerHTML={{ __html: mapEmbed }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
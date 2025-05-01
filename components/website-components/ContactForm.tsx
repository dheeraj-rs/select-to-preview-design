"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FieldProps {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface ContactFormProps {
  heading: string;
  subheading: string;
  buttonText: string;
  fields: FieldProps[];
  backgroundColor: string;
  textColor: string;
}

export function ContactForm({
  heading,
  subheading,
  buttonText,
  fields,
  backgroundColor,
  textColor,
}: ContactFormProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit the form data to a server
    toast({
      title: "Form submitted",
      description: "Your message has been sent successfully!",
    });
  };

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{heading}</h2>
          <p className="text-lg">{subheading}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
          {fields.map((field) => (
            <div key={field.name}>
              <Label
                htmlFor={field.name}
                className="mb-2 block"
                style={{ color: textColor }}
              >
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full"
                  rows={4}
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full"
                />
              )}
            </div>
          ))}
          
          <Button type="submit" className="w-full">
            {buttonText}
          </Button>
        </form>
      </div>
    </section>
  );
}
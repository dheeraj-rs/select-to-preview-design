"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  title: string;
  avatar: string;
}

interface TestimonialsProps {
  heading: string;
  testimonials: TestimonialProps[];
  backgroundColor: string;
  textColor: string;
}

export function Testimonials({
  heading,
  testimonials,
  backgroundColor,
  textColor,
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  if (!testimonials.length) return null;

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
        
        <div className="relative">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-6">
            <p className="text-lg md:text-xl italic mb-6" style={{ color: textColor }}>
              "{testimonials[currentIndex].quote}"
            </p>
            <div className="flex items-center">
              <img
                src={testimonials[currentIndex].avatar}
                alt={testimonials[currentIndex].author}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold" style={{ color: textColor }}>
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm" style={{ color: textColor }}>
                  {testimonials[currentIndex].title}
                </p>
              </div>
            </div>
          </div>
          
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
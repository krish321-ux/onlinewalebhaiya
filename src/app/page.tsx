'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSecureUrl } from '@/lib/secureUrl';
import { useEffect, useState, useRef, useCallback } from 'react';
import FilterSection from '@/components/FilterSection';
import { galleryAPI } from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}


export default function Home() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const servicesInView = useInView(servicesRef);
  const whyInView = useInView(whyRef);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      {/* Image Gallery Section (Hero Banner) */}
      <ImageGallery />

      {/* Hero Text Section */}
      <section className="relative py-8 sm:py-12 md:py-20 flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8652D]/20 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8652D]/10 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8652D]/5 rounded-full blur-[120px]" style={{ animationDelay: '1.5s', animation: 'float 4s ease-in-out infinite' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8652D]/10 border border-[#E8652D]/20 text-[#E8652D] text-sm font-semibold mb-6">
              <Zap className="h-4 w-4" /> Where Form Fillup by Bhaiya at ₹49
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 px-2" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
            <span className="text-white">Any Form, </span>
            <span className="text-gradient">Any Time.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-xl text-zinc-400 mb-2 max-w-2xl mx-auto leading-relaxed px-4 sm:px-2" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
            Your one-stop destination for Government Jobs, Scholarships, and Online Services across India.
          </p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* Filter Section */}
      <FilterSection />

      {/* Services Section */}
      <section ref={servicesRef} className="py-12 sm:py-16 md:py-24 bg-[#0a0a0a] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-[#E8652D] font-semibold text-sm uppercase tracking-widest mb-3">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Everything you need to succeed in your career journey.</p>
          </div>

          <ServiceSlider inView={servicesInView} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={whyRef} className="py-12 sm:py-16 md:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className={whyInView ? 'animate-slide-in-left' : 'opacity-0'}>
              <span className="inline-block text-[#E8652D] font-semibold text-sm uppercase tracking-widest mb-3">Why Us</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">Why Choose <span className="text-gradient">OnlineWaleBhaiya?</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Users className="h-5 w-5" />,
                    title: 'Filled by Expert Bhaiya',
                    sub: 'Every form is filled by a trained expert — error-free and on time, every time.',
                    delay: 0.1,
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: 'Document Deletion Video Proof',
                    sub: 'After work is done, we send you a video proof of your documents being permanently deleted.',
                    delay: 0.2,
                  },
                  {
                    icon: <Zap className="h-5 w-5" />,
                    title: 'Live Screen Sharing',
                    sub: 'We share our screen while filling your form so you can watch and verify every detail live.',
                    delay: 0.3,
                  },
                  {
                    icon: <Clock className="h-5 w-5" />,
                    title: 'Update at Every Step',
                    sub: 'You get a real-time update at each stage — from submission to final confirmation.',
                    delay: 0.4,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex gap-4 p-4 rounded-2xl bg-[#111] border border-zinc-800 hover:border-[#E8652D]/40 hover:bg-[#E8652D]/5 transition-all duration-300"
                    style={{ animation: whyInView ? `fadeInUp 0.5s ease-out ${item.delay}s both` : 'none' }}
                  >
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-[#E8652D]/10 border border-[#E8652D]/20 flex items-center justify-center text-[#E8652D] group-hover:bg-[#E8652D] group-hover:text-white transition-all duration-300 mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm mb-1 group-hover:text-[#FF7A42] transition-colors">{item.title}</p>
                      <p className="text-zinc-500 text-xs leading-relaxed">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 text-[#E8652D] font-semibold hover:text-[#FF7A42] transition-colors group">
                  Request a service <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className={`relative ${whyInView ? 'animate-fade-in-scale' : 'opacity-0'}`}>
              <div className="relative h-60 sm:h-72 lg:h-[450px] rounded-3xl overflow-hidden bg-[#111] border border-zinc-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8652D]/10 to-transparent" />
                <div className="text-center z-10 p-8 w-full">
                  <p className="text-zinc-500 text-sm uppercase tracking-widest font-medium mb-6">Reach Us Directly</p>
                  <div className="flex flex-col gap-4 justify-center max-w-sm mx-auto w-full">
                    {/* Phone */}
                    <a href="tel:+918581823795"
                      className="group flex items-center gap-3 px-6 py-4 bg-[#E8652D]/10 hover:bg-[#E8652D] border border-[#E8652D]/30 hover:border-[#E8652D] rounded-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,101,45,0.4)]">
                      <span className="w-10 h-10 rounded-xl bg-[#E8652D]/20 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E8652D] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <p className="text-xs text-zinc-400 group-hover:text-white/70 transition-colors">Call Us</p>
                        <p className="text-white font-bold text-sm">+91 8581823795</p>
                      </div>
                    </a>
                    {/* WhatsApp */}
                    <a href="https://wa.me/918581823795?text=Hi%2C%20I%20need%20help%20with%20a%20service" target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 rounded-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/20 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <p className="text-xs text-zinc-400 group-hover:text-white/70 transition-colors">WhatsApp</p>
                        <p className="text-white font-bold text-sm">Chat with Us</p>
                      </div>
                    </a>
                  </div>

                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#E8652D]/20 rounded-full blur-[40px]" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E8652D] to-[#FF7A42]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">Our Simple <span className="text-white/80 italic">4-Step</span> Form Filling Process</h2>
            <p className="text-white/70 text-lg">Accurate. Transparent. Fast.</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {[
              {
                step: 1,
                icon: '📞',
                title: 'Contact & Confirmation',
                lines: ['Call or WhatsApp us with your form details.', 'We confirm eligibility, fees & required documents.'],
              },
              {
                step: 2,
                icon: '📁',
                title: 'Secure Document Submission',
                lines: ['Send your documents securely via WhatsApp or Website.', 'Our expert fills your form carefully and accurately.'],
              },
              {
                step: 3,
                icon: '🔍',
                title: 'Preview & Verification',
                lines: ['We send you the completed form preview (PDF/screenshot).', 'You verify spelling, details & category, then approve.'],
              },
              {
                step: 4,
                icon: '🚀',
                title: 'Final Submission & Live Update',
                lines: ['After your approval, we submit the form.', 'You receive confirmation + final update immediately.'],
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-9 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-white/30 z-0" />
                )}
                {/* Step bubble */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-white text-[#E8652D] rounded-full text-xs font-extrabold flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-2 leading-snug">{item.title}</h3>
                <ul className="space-y-1">
                  {item.lines.map((line, j) => (
                    <li key={j} className="text-white/65 text-xs leading-relaxed">{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 bg-white text-[#E8652D] hover:bg-zinc-100 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Get Started Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div >
  );
}




interface ServiceData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  icon_url?: string | null;
}

function ServiceSlider({ inView }: { inView: boolean }) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else if (window.innerWidth < 1280) setVisibleCards(3);
      else setVisibleCards(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (services.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevSlide = useCallback(() => {
    if (services.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  useEffect(() => {
    if (isPaused || services.length === 0) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, services.length]);

  if (services.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden group/slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
        }}
      >
        {services.concat(services.slice(0, visibleCards)).map((svc, index) => (
          <div
            key={`${svc.id}-${index}`}
            className="shrink-0 px-2 sm:px-3"
            style={{ width: `${100 / visibleCards}%` }}
          >
            <ServiceCard
              id={svc.id}
              title={svc.title}
              description={svc.description}
              image_url={svc.image_url}
              icon_url={svc.icon_url}
              inView={inView}
              delay={index < visibleCards ? index * 150 : undefined}
            />
          </div>
        ))}
      </div>

      {/* Manual Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#E8652D] text-white p-2 rounded-r-xl opacity-100 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#E8652D] text-white p-2 rounded-l-xl opacity-100 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-6 sm:mt-10 gap-1.5 sm:gap-2 flex-wrap max-w-xs sm:max-w-none mx-auto">
        {services.map((_, index) => {
          const distance = Math.abs(currentIndex - index);
          const wrapDistance = Math.abs(currentIndex - index + services.length) % services.length;
          const minDist = Math.min(distance, wrapDistance);
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${minDist > 4 ? 'hidden sm:block' : ''} ${currentIndex === index ? 'w-6 sm:w-8 bg-[#E8652D]' : 'w-1.5 sm:w-2 bg-zinc-700'}`}
            />
          );
        })}
      </div>
    </div>
  );
}


function ImageGallery() {
  const [images, setImages] = useState<{ id: string; image_url: string; title: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    galleryAPI.getImages()
      .then(data => {
        if (data && data.length > 0) {
          setImages(data.map((img: any) => ({ id: img.id, image_url: img.image_url, title: img.title })));
        }
      })
      .catch(() => { });
  }, []);

  const next = useCallback(() => setActiveIndex(p => (p + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActiveIndex(p => (p - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (isPaused || images.length === 0) return;
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [isPaused, next, images.length]);

  if (images.length === 0) return null;

  return (
    <section>
      {/* ── Full-width image banner (1366×379 aspect ratio) ── */}
      <div
        className="relative w-full overflow-hidden bg-[#0a0a0a]"
        style={{ aspectRatio: '1366 / 379' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {images.map((img, i) => (
          <Link
            key={img.id}
            href={`/gallery/${img.id}`}
            className="absolute inset-0 transition-opacity duration-700 cursor-pointer"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              zIndex: i === activeIndex ? 2 : 0,
              pointerEvents: i === activeIndex ? 'auto' : 'none',
            }}
          >
            <img
              src={getSecureUrl(img.image_url)}
              alt={img.title || `Gallery ${i + 1}`}
              className="w-full h-full object-contain"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </Link>
        ))}

        {/* Nav arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prev(); }}
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 bg-transparent sm:bg-black/55 hover:bg-[#E8652D] text-zinc-900 sm:text-white p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 border-0 sm:border sm:border-white/10 sm:backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); next(); }}
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 bg-transparent sm:bg-black/55 hover:bg-[#E8652D] text-zinc-900 sm:text-white p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 border-0 sm:border sm:border-white/10 sm:backdrop-blur-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Progress dots (overlaid on image) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setActiveIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-[#E8652D]' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}



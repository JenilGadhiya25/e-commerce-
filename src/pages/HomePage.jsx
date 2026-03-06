import HeroSection from "../components/HeroSection.jsx";
import CategorySection from "../components/CategorySection.jsx";
import BestSellersSection from "../components/BestSellersSection.jsx";
import PrintsBannerSection from "../components/PrintsBannerSection.jsx";
import InfoSection from "../components/InfoSection.jsx";
import ShippingProcessSection from "../components/ShippingProcessSection.jsx";
import WhyChooseSection from "../components/WhyChooseSection.jsx";
import TestimonialsSection from "../components/TestimonialsSection.jsx";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <BestSellersSection />
      <TestimonialsSection />
      <PrintsBannerSection />
      <InfoSection />
      <WhyChooseSection />
      <ShippingProcessSection />
    </>
  );
}

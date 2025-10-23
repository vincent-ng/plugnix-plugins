import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ArchitectureSection from './components/ArchitectureSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <ArchitectureSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
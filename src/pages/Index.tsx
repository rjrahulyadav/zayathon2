import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ProblemStatements from "@/components/ProblemStatements";
import Prizes from "@/components/Prizes";
import Timeline from "@/components/Timeline";
import Sponsors from "@/components/Sponsors";
import Team from "@/components/Team";
import Registration from "@/components/Registration";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <ProblemStatements />
      <Prizes />
      <Timeline />
      <Sponsors />
      <Team />
      <Registration />
      <Footer />
    </div>
  );
};

export default Index;

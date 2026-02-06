import { motion } from "framer-motion";

const sponsors = {
  platinum: [
    { name: "TechCorp", logo: "D" },
    { name: "InnovateTech", logo: "I" },
  ],
  gold: [
    { name: "DevStudio", logo: "D" },
    { name: "CloudBase", logo: "C" },
    { name: "AILabs", logo: "A" },
  ],
  silver: [
    { name: "StartupHub", logo: "S" },
    { name: "CodeSchool", logo: "C" },
    { name: "DataDrive", logo: "D" },
    { name: "WebFlow", logo: "W" },
  ],
};

const SponsorCard = ({
  sponsor,
  tier,
  index,
}: {
  sponsor: { name: string; logo: string };
  tier: string;
  index: number;
}) => {
  const sizeClasses = {
    platinum: "w-32 h-32 md:w-40 md:h-40 text-4xl",
    gold: "w-24 h-24 md:w-32 md:h-32 text-3xl",
    silver: "w-20 h-20 md:w-24 md:h-24 text-2xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`glow-card ${sizeClasses[tier as keyof typeof sizeClasses]} flex items-center justify-center font-display font-bold text-primary cursor-pointer`}
    >
      {sponsor.logo}
    </motion.div>
  );
};

const Sponsors = () => {
  const handleSponsorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const email = "director@zayathon.in";
    const subject = "Sponsorship Inquiry for Zayathon 2026";
    const body = "Hi Zayathon Team,\n\nI am interested in learning more about sponsorship opportunities for Zayathon 2026.\n\n";
    
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use mailto (works reliably)
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      // On desktop, open Gmail compose in new tab (more reliable than mailto)
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    }
  };

  return (
    <section id="sponsors" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Our <span className="text-gradient">Sponsors</span>
          </h2>
          <p className="section-subtitle">
            We're proud to partner with industry leaders who make Zayathon possible.
          </p>
        </motion.div>

        {/* Platinum Sponsors */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center font-display text-xl text-muted-foreground mb-6 tracking-widest"
          >
            PLATINUM PARTNERS
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-8">
            {sponsors.platinum.map((sponsor, index) => (
              <SponsorCard key={sponsor.name} sponsor={sponsor} tier="platinum" index={index} />
            ))}
          </div>
        </div>

        {/* Gold Sponsors */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center font-display text-lg text-muted-foreground mb-6 tracking-widest"
          >
            GOLD PARTNERS
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-6">
            {sponsors.gold.map((sponsor, index) => (
              <SponsorCard key={sponsor.name} sponsor={sponsor} tier="gold" index={index} />
            ))}
          </div>
        </div>

        {/* Silver Sponsors */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center font-display text-lg text-muted-foreground mb-6 tracking-widest"
          >
            SILVER PARTNERS
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.silver.map((sponsor, index) => (
              <SponsorCard key={sponsor.name} sponsor={sponsor} tier="silver" index={index} />
            ))}
          </div>
        </div>

        {/* Become a Sponsor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Interested in sponsoring Zayathon?
          </p>
          <motion.a
            href="mailto:director@zayathon.in"
            onClick={handleSponsorClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neon-button-secondary inline-block text-sm py-3 px-6 cursor-pointer"
          >
            Become a Sponsor
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsors;

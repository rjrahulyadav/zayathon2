import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";

const prizes = [
  {
    position: "1st",
    title: "Grand Champion",
    amount: "₹3000",
    icon: Trophy,
    color: "from-yellow-400 to-amber-600",
    benefits: ["Cash Prize", "Internship Opportunity", "Goodies & Swags", "Certificate"],
    featured: true,
  },
  {
    position: "2nd",
    title: "First Runner Up",
    amount: "₹2000",
    icon: Medal,
    color: "from-gray-300 to-gray-500",
    benefits: ["Cash Prize", "Goodies & Swags", "Certificate"],
    featured: false,
  },
  {
    position: "3rd",
    title: "Second Runner Up",
    amount: "₹1000",
    icon: Award,
    color: "from-amber-600 to-amber-800",
    benefits: ["Cash Prize", "Goodies & Swags", "Certificate"],
    featured: false,
  },
];

const specialPrizes = [
  { title: "Best UI/UX", amount: "****" },
  { title: "Best Innovation", amount: "****" },
  { title: "Best Use of AI", amount: "****" },
  { title: "People's Choice", amount: "****" },
];

const Prizes = () => {
  return (
    <section id="prizes" className="py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Prize <span className="text-gradient">Pool</span>
          </h2>
          <p className="section-subtitle">
            Compete for amazing prizes worth over ₹10000! Winners get cash prizes,
            internship opportunities, and exclusive goodies.
          </p>
        </motion.div>

        {/* Main Prizes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {prizes.map((prize, index) => (
            <motion.div
              key={prize.position}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`glow-card p-8 text-center ${
                prize.featured ? "md:-mt-8 md:mb-8" : ""
              }`}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center mb-6`}
              >
                <prize.icon className="w-10 h-10 text-background" />
              </motion.div>

              <div className="font-display text-lg text-muted-foreground mb-2">
                {prize.position} Place
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-foreground">
                {prize.title}
              </h3>
              <div className="font-display text-4xl font-black text-primary glow-text mb-6">
                {prize.amount}
              </div>

              <ul className="space-y-2">
                {prize.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center justify-center gap-2 text-muted-foreground text-sm"
                  >
                    <Star className="w-4 h-4 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Special Prizes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="font-display text-2xl font-bold text-center mb-8 text-foreground">
            Special <span className="text-secondary">Categories</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialPrizes.map((prize, index) => (
              <motion.div
                key={prize.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glow-card p-6 text-center"
              >
                <h4 className="font-display text-lg font-bold text-foreground mb-2">
                  {prize.title}
                </h4>
                <div className="font-display text-xl font-bold text-secondary glow-text-magenta">
                  {prize.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Prizes;

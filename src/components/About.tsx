import { motion } from "framer-motion";
import { Code, Users, Trophy, Rocket } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "10 Hours of Coding",
    description: "Non-stop innovation and problem-solving with cutting-edge technologies.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Form teams of up to 4 members and work together to build amazing projects.",
  },
  {
    icon: Trophy,
    title: "Amazing Prizes",
    description: "Win exciting prizes including cash rewards, gadgets, and internship opportunities.",
  },
  {
    icon: Rocket,
    title: "Real-World Problems",
    description: "Solve actual industry challenges provided by our corporate partners.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            About <span className="text-gradient">Zayathon</span>
          </h2>
          <p className="section-subtitle">
            Join the most anticipated hackathon of the year. Open to all students from 1st to 3rd year.
            Showcase your skills, learn from experts, and build the future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="glow-card p-6 group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
              >
                <feature.icon className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-display text-xl font-bold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "500+", label: "Participants" },
            { value: "100+", label: "Teams" },
            { value: "₹10000", label: "Prize Pool" },
            { value: "10+", label: "Problem Domains" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-primary glow-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground uppercase tracking-widest text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;

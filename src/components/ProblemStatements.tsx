import { motion } from "framer-motion";
import { FileText, Lightbulb, Target } from "lucide-react";

const problemStatements = [
  "Agentic AI",
  "Robotics & Autonomous Systems",
  "Cybersecurity & Threat Intelligence",
  "HealthTech & MedAI",
  "FinTech & Blockchain",
  "Smart Cities & IoT",
  "Agritech & Rural Innovation",
  "Transportation & Logistics",
  "Open Innovation",
];

const ProblemStatements = () => {
  return (
    <section id="problem-statements" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Problem <span className="text-gradient">Domains</span>
          </h2>
          <p className="section-subtitle">
            Choose from our diverse range of industry-relevant challenges and showcase your innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {problemStatements.map((statement, index) => (
            <motion.div
              key={statement}
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
                <Target className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-display text-lg font-bold mb-2 text-foreground">
                {statement}
              </h3>
              <p className="text-muted-foreground text-sm">
                Tackle real-world challenges in this domain and build innovative solutions.
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium">
            <Lightbulb className="w-5 h-5" />
            Ready to innovate? Register your team now!
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemStatements;
import { motion } from "framer-motion";
import { Calendar, Users, Code, FileCheck, Trophy } from "lucide-react";

const timelineEvents = [
  {
    date: "Feb 6, 2026",
    title: "Registration Opens",
    description: "Start registering your team and prepare for the ultimate coding challenge.",
    icon: Calendar,
  },
  {
    date: "Feb 7, 2026",
    title: "Team Selection Announced",
    description: "Selected teams will be announced. Check your email for confirmation.",
    icon: Users,
  },
  {
    date: "Feb 6, 2026",
    title: "Problem Statements Released",
    description: "Choose from 20+ industry-relevant problem statements.",
    icon: FileCheck,
  },
  {
    date: "Feb 10, 2026",
    title: "Hackathon Days",
    description: "10 hours of non-stop coding, mentoring sessions, and workshops.",
    icon: Code,
  },
  {
    date: "Feb 10, 2026",
    title: "Final Judging & Awards",
    description: "Present your projects and win amazing prizes!",
    icon: Trophy,
  },
];

const Timeline = () => {
  return (
    <section id="timeline" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Event <span className="text-gradient">Timeline</span>
          </h2>
          <p className="section-subtitle">
            Mark your calendars! Here's everything you need to know about the schedule.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary" />

          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Timeline Dot */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10"
                style={{
                  boxShadow: "0 0 20px hsl(var(--neon-cyan) / 0.5)",
                }}
              >
                <event.icon className="w-5 h-5 text-primary" />
              </motion.div>

              {/* Content Card */}
              <div
                className={`ml-16 md:ml-0 md:w-5/12 ${
                  index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glow-card p-6"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-display tracking-wider mb-3">
                    {event.date}
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {event.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;

import { motion } from "framer-motion";
import { Linkedin, Twitter, Github } from "lucide-react";
import organizer1 from "../assets/organizer-1.jpg";
import organizer2 from "../assets/organizer-2.jpeg";
import organizer3 from "../assets/organizer-3.jpeg";
import organizer4 from "../assets/organizer-4.jpg";

const team = [
  {
    name: "Rahul Kumar Yadav",
    role: "Lead Organizer",
    image: organizer1,
    social: { linkedin: "https://linkedin.com/in/rahul-kumar-yadav-909a95320", github: "https://github.com/rjrahulyadav" },
  },
  {
    name: "Aditya Chaurasiya",
    role: "Technical Head",
    image: organizer2,
    social: { linkedin: "https://linkedin.com/in/adityachaurasiya7", github: "https://github.com/aditya84ya" },
  },
  {
    name: "Akash Adhikari",
    role: "Operations Lead",
    image: organizer3,
    social: { linkedin: "https://linkedin.com/in/akash-adhikari-64a5a9328",  github: "https://github.com/akashahir798" },
  },
  {
    name: "Shivshankar Kumar Jaisawal",
    role: "Marketing Head",
    image: organizer4,
    social: { linkedin: "https://linkedin.com/in/shivshankar-kumar-jaisawal-0228b8335",  github: "#" },
  },
];

const Team = () => {
  return (
    <section id="team" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">
            Our <span className="text-gradient">Team</span>
          </h2>
          <p className="section-subtitle">
            Meet the passionate individuals behind Zayathon who work tirelessly to make this event a success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="glow-card p-6 text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/50"
                style={{
                  boxShadow: "0 0 20px hsl(var(--neon-cyan) / 0.3)",
                }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-primary text-sm font-display tracking-wider mb-4">
                {member.role}
              </p>

              <div className="flex justify-center gap-4">
                {[
                  { icon: Linkedin, target:"_blank", href: member.social.linkedin },
                  { icon: Github, target:"_blank", href: member.social.github },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.2, y: -3 }}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

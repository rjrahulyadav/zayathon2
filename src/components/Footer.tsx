import { motion } from "framer-motion";
import { Heart, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <motion.a
              href="#home"
              className="font-display text-3xl font-bold text-primary glow-text inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              ZAYATHON
            </motion.a>
            <p className="text-muted-foreground mb-4 max-w-md">
              The ultimate hackathon experience for students. Join us to build, innovate,
              and win amazing prizes while solving real-world problems.
            </p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Instagram", "Discord"].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-sm font-display"
                >
                  {social[0]}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["About", "Prizes", "Timeline", "Sponsors", "Team", "Register"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold text-foreground mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:contact@zayathon.com" className="hover:text-primary transition-colors">
                  zayacodehub@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>+917033399183</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span>SONA COLLEGE OF TECHNOLOGY,<br />SALEM TAMIL NADU, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 Zaya Code Hub. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-secondary animate-pulse" /> by the Zayathon Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

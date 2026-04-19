import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_NUMBER } from "@/data/config";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-serif text-2xl italic">Designs by OVKB</p>
          <p className="text-xs tracking-[0.3em] uppercase mt-2 opacity-70">
            Handcrafted with love · Sri Lanka
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hover:text-accent transition-colors duration-300"
          >
            <FaWhatsapp className="text-xl" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-accent transition-colors duration-300"
          >
            <FaInstagram className="text-xl" />
          </a>
        </div>

        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} OVKB Studio
        </p>
      </div>
    </footer>
  );
};

export default Footer;

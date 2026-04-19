import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-warm-gradient overflow-hidden px-6"
    >
      {/* Decorative soft circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" aria-hidden />

      <div className="relative max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-sm tracking-[0.35em] uppercase text-muted-foreground mb-8"
        >
          Designs by OVKB
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.05] text-foreground"
        >
          Every design <br />
          <span className="italic text-accent">tells a story.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          Handcrafted greeting cards made with care — for the people, the moments,
          and the words that deserve more than ordinary.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-12"
        >
          <a
            href="#gallery"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-[0.2em] uppercase hover:bg-accent transition-colors duration-500"
          >
            Explore Designs
            <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

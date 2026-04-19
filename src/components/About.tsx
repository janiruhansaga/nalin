import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-28 md:py-40 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-4">About</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium">
            The Story Behind <br />
            <span className="italic">Designs by OVKB</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="space-y-5"
          >
            <div className="aspect-[4/5] bg-muted overflow-hidden shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
                alt="Oshadha and his dog Broody"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="font-serif italic text-center text-muted-foreground text-lg">
              "Every design tells a story."
            </p>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground"
          >
            <p>
              Hello, I'm <span className="text-foreground font-medium">Oshadha</span> —
              the hands and heart behind Designs by OVKB. What started as small
              hand-drawn notes for friends has grown into a quiet little studio
              dedicated to the craft of meaningful greeting cards.
            </p>
            <p>
              Each piece is designed slowly, with intention. I believe a good card
              is more than paper — it's a small object that carries a feeling,
              folded and sealed and sent across the world.
            </p>
            <p>
              When I'm not designing, you'll find me sketching in cafés with my
              dog <span className="text-foreground font-medium">Broody</span>{" "}
              beside me — usually plotting the next collection.
            </p>
            <div className="pt-4">
              <span className="inline-block h-px w-16 bg-accent mr-4 align-middle" />
              <span className="text-sm tracking-[0.3em] uppercase text-foreground">
                Oshadha · OVKB Studio
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;

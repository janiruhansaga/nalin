import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { useCatalog } from "@/hooks/useProducts";

const resolveImage = (image_url: string): string => {
  if (!image_url) return "";
  if (image_url.startsWith("http://") || image_url.startsWith("https://") || image_url.startsWith("data:")) {
    return image_url;
  }
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${image_url.replace(/^\//, "")}`;
};

const Gallery = () => {
  const { products, whatsapp_number } = useCatalog();

  const buildWhatsAppLink = (title: string) => {
    const text = encodeURIComponent(`Hi, I would like to order this card: ${title}`);
    return `https://wa.me/${whatsapp_number}?text=${text}`;
  };

  return (
    <section id="gallery" className="py-28 md:py-40 px-6 bg-warm-gradient">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-4">The Collection</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium">
            A Gallery of <span className="italic">Little Stories</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Browse the designs below. Found one you love? Tap{" "}
            <span className="text-foreground">Order</span> and we'll continue on WhatsApp.
          </p>
        </motion.div>

        {/* Masonry-style columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: (index % 3) * 0.08 }}
              className="group relative mb-6 break-inside-avoid bg-card shadow-card hover:shadow-soft transition-all duration-500 overflow-hidden"
            >
              <div className="overflow-hidden">
                <img
                  src={resolveImage(product.image_url)}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div className="p-6 flex items-center justify-between gap-4">
                <h3 className="font-serif text-xl md:text-2xl text-foreground">
                  {product.title}
                </h3>
                <a
                  href={buildWhatsAppLink(product.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Order ${product.title} on WhatsApp`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/80 text-foreground text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                  <FaWhatsapp className="text-base" />
                  Order
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

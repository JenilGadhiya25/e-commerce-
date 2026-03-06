const cards = [
  {
    title: "Shipping Packaging Material that Won’t Break Your Bank",
    desc: "ARK Packaging offers budget-friendly courier bags that still maintain professional and cohesive packaging. We provide multiple bag shapes and sizes, and you can customize them to match your brand for a consistent customer experience.",
  },
  {
    title: "Effective Storytelling Tool",
    desc: "Custom-made shipping packaging acts as a visual extension of your brand. Add your logo, tagline, and brand colors so every parcel aligns with your identity—before it’s even opened.",
  },
  {
    title: "Lighter and Compact",
    desc: "Courier bags are lighter and more compact than traditional packaging materials, improving space utilization and shipping efficiency—especially for high-volume dispatch.",
  },
  {
    title: "Long Lasting",
    desc: "Courier bags are made from heavy-duty HDPE material, making them durable, tear-resistant, and long-lasting through daily handling and long-distance transit.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="whyChoose" aria-label="Why choose ARK Packaging">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">
            Why Choose ARK Packaging for Packaging Courier Bags and Custom Printing Services?
          </h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="whyGrid">
          {cards.map((card) => (
            <article key={card.title} className="whyCard">
              <h3 className="whyCard__title">{card.title}</h3>
              <p className="whyCard__desc">{card.desc}</p>
            </article>
          ))}
        </div>

        <div className="whyCta" aria-label="Wholesale call to action">
          <div className="whyCta__title">
            Want Wholesale <span className="whyCta__blue">Printed Bags</span> and Shipping Packaging Material?
            {" "}Order Now
          </div>
          <p className="whyCta__desc">
            Whether you’re an online seller, a distribution center, or a D2C brand, ARK courier bags
            provide best-in-class packaging solutions at affordable prices—built for fast dispatch
            and a premium brand presence.
          </p>
        </div>
      </div>
    </section>
  );
}


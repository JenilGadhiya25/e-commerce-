import whiteFloral from "../assets/info-white-floral.svg";
import purpleHey from "../assets/info-purple-hey.svg";
import pinkPretty from "../assets/info-pink-pretty.svg";
import blackRibbon from "../assets/info-black-ribbon.svg";

export default function InfoSection() {
  return (
    <section className="infoSection" aria-label="Courier bag benefits">
      <div className="container">
        <div className="sectionTitle infoTitle">
          <h2 className="sectionTitle__text">
            Sleek and High-Strength Packaging Courier Bags For All Your Shipping Needs
          </h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="infoIntro">
          <p>
            The eCommerce industry is growing rapidly, and with that growth comes an even higher
            expectation for safe, damage-free delivery. Reliable courier packaging plays a crucial
            role in protecting products from handling, moisture, and transit impacts—helping your
            customers receive their orders in perfect condition.
          </p>
          <p>
            A poor delivery experience doesn’t just cause returns; it reduces trust. Torn, wet, or
            poorly packed parcels lead to customer dissatisfaction, negative reviews, and lost
            revenue—especially when buyers can easily switch to another brand after one bad
            experience.
          </p>
          <p>
            ARK Packaging Enterprise provides premium shipping solutions tailored for modern brands.
            Explore our{" "}
            <a className="inlineLink" href="#" aria-label="Browse Courier Bags">
              Courier Bags
            </a>{" "}
            range for strong, stylish, and brand-ready packaging built for everyday dispatch.
          </p>
        </div>

        <div className="infoGrid">
          <div className="showcase" aria-label="Courier bag product showcase">
            <div className="showcase__stage">
              <ShowcaseItem
                className="showcaseItem showcaseItem--white"
                img={whiteFloral}
                alt="White printed courier bag with floral design"
              />
              <ShowcaseItem
                className="showcaseItem showcaseItem--purple"
                img={purpleHey}
                alt='Purple courier bag with text "Hey there!! I have arrived!"'
              />
              <ShowcaseItem
                className="showcaseItem showcaseItem--pink"
                img={pinkPretty}
                alt='Pink courier bag with smile design and text "Pretty Thing Inside"'
              />
              <ShowcaseItem
                className="showcaseItem showcaseItem--black"
                img={blackRibbon}
                alt="Black courier bag with ribbon illustration"
              />
            </div>
          </div>

          <div className="infoCopy">
            <h3 className="infoCopy__title">Stylish And Durable Wholesale Printed Bags At Great Prices</h3>
            <p>
              In eCommerce, packaging is often the first physical impression of your brand. A clean,
              premium courier bag elevates unboxing, signals quality, and builds confidence—before a
              customer even sees the product.
            </p>
            <p>
              Our HDPE courier bags are designed for performance: lightweight, waterproof, and
              tear-resistant to safeguard parcels during shipping. With custom branding options,
              you get better visibility, a more professional look, and packaging that works as
              marketing—every time it ships.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseItem({ className, img, alt }) {
  return (
    <div className={className}>
      <div className="showcaseItem__pedestal" aria-hidden="true" />
      <img className="showcaseItem__img" src={img} alt={alt} />
    </div>
  );
}


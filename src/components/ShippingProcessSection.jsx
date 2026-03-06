import { IconBagSimple, IconPencil, IconTruck } from "./icons/Icons.jsx";

export default function ShippingProcessSection() {
  return (
    <section className="shipProcessSection" aria-label="Shipping cost benefits and ordering process">
      <div className="container">
        <div className="sectionTitle shipTitle">
          <h2 className="sectionTitle__text">
            Cut down Shipping Costs. Save Immensely with Our Custom Bags for Packaging
          </h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="shipCopy">
          <p>
            Traditional corrugated boxes are bulky, heavier, and take up more space during storage
            and transit. That extra material and volume often translates into higher shipping charges
            and added handling costs.
          </p>
          <p>
            Switching to lightweight courier packaging helps reduce freight expenses without
            compromising on protection—especially for apparel, accessories, documents, and
            non-fragile items that don’t require rigid boxing.
          </p>
          <p>
            Our{" "}
            <a className="inlineLink" href="#" aria-label="Browse Courier Bags">
              Courier Bags
            </a>{" "}
            typically weigh less than 30 grams and can significantly reduce dimensional (DIM) weight
            charges for many orders—helping you ship more efficiently at lower costs.
          </p>
          <p>
            Key benefits include self-sealing adhesive tape, protection against tampering, a
            lightweight and user-friendly design, and a more economical alternative to corrugated
            boxes—perfect for fast daily dispatch.
          </p>
        </div>

        <div className="processBlock" aria-label="Ordering process">
          <div className="sectionTitle processTitle">
            <h3 className="processTitle__text">From Idea to Delivery – Here’s How!</h3>
            <div className="sectionTitle__underline" aria-hidden="true" />
          </div>

          <div className="processSteps" role="list">
            <ProcessStep
              icon={<IconBagSimple />}
              tone="beige"
              title="Choose Your Courier Bag"
              subtitle="Choose Your Bag Type, Size And Color"
            />
            <ProcessStep
              icon={<IconPencil />}
              tone="purple"
              title="Customize the Design"
              subtitle="Add Your Logo And Branding"
            />
            <ProcessStep
              icon={<IconTruck />}
              tone="blue"
              title="Get them Delivered"
              subtitle="Fast And Reliable Shipping"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ icon, title, subtitle, tone }) {
  return (
    <div className="processStep" role="listitem">
      <div className={`processIcon processIcon--${tone}`} aria-hidden="true">
        {icon}
      </div>
      <div className="processStep__title">{title}</div>
      <div className="processStep__subtitle">{subtitle}</div>
    </div>
  );
}


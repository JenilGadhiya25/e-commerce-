import avatarVipul from "../assets/avatar-vipul.svg";
import avatarMasterCaps from "../assets/avatar-mastercaps.svg";
import avatarDevanshu from "../assets/avatar-devanshu.svg";
import { IconStar } from "./icons/Icons.jsx";

const testimonials = [
  {
    name: "Vipul Sharma",
    product: "Custom Printed White Courier Bags – 51 micron",
    avatar: avatarVipul,
    review:
      "Very happy with my purchase! The parcel was delivered on time, and the quality is excellent.",
  },
  {
    name: "MASTER CAPS",
    product: "Custom Printed Frosted Slider Zipper Lock Bags",
    avatar: avatarMasterCaps,
    review: "quality was quit good",
  },
  {
    name: "Devanshu Chaudhary",
    product: "Custom Printed Black Courier Covers – 60 Micron",
    avatar: avatarDevanshu,
    review: "good quality very nice",
  },
  {
    name: "Vipul Sharma",
    product: "Custom Printed White Courier Bags – 51 micron",
    avatar: avatarVipul,
    review:
      "Very happy with my purchase! The parcel was delivered on time, and the quality is excellent.",
  },
  {
    name: "MASTER CAPS",
    product: "Custom Printed Frosted Slider Zipper Lock Bags",
    avatar: avatarMasterCaps,
    review: "quality was quit good",
  },
  {
    name: "Devanshu Chaudhary",
    product: "Custom Printed Black Courier Covers – 60 Micron",
    avatar: avatarDevanshu,
    review: "good quality very nice",
  }
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials" aria-label="Customer testimonials">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">What People Are Saying</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="testimonialGrid">
          {testimonials.map((t) => (
            <article key={t.name} className="testimonialCard">
              <div className="testimonialHead">
                <div>
                  <div className="testimonialName">{t.name}</div>
                  <div className="testimonialProduct">{t.product}</div>
                </div>
                <img className="testimonialAvatar" src={t.avatar} alt={`${t.name} avatar`} loading="lazy" />
              </div>

              <div className="testimonialStars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>

              <p className="testimonialQuote">“{t.review}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


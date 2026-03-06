import plainPink from "../assets/category-plain-pink.svg";
import customPurple from "../assets/category-custom-purple.svg";
import printedBlack from "../assets/category-printed-black.svg";
import frostedWhite from "../assets/category-frosted-white.svg";
import { IconArrowRight } from "./icons/Icons.jsx";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Plain Courier Bags",
    image: plainPink,
    button: "Order Plain Bags",
    href: "/plain-courier-bags",
  },
  {
    title: "Customise Courier Bags",
    image: customPurple,
    button: "Order Custom Bags",
    href: "/custom-printed-courier-bags",
  },
  {
    title: "Printed Courier Bags",
    image: printedBlack,
    button: "Order Printed Bags",
  },
  {
    title: "Frosted Bags",
    image: frostedWhite,
    button: "Order Frosted Bags",
  },
];

export default function CategorySection() {
  return (
    <section className="categorySection" aria-label="Select your packaging bag style">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Select Your Packaging Bag Style !</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="categoryGrid">
          {categories.map((cat) => (
            <article key={cat.title} className="categoryCard">
              <div className="categoryCard__imgWrap">
                <img className="categoryCard__img" src={cat.image} alt={cat.title} />
              </div>
              <h3 className="categoryCard__title">{cat.title}</h3>
              {cat.href ? (
                <Link className="pillBtn" to={cat.href} aria-label={`${cat.button}`}>
                  <span>{cat.button}</span>
                  <IconArrowRight className="pillBtn__icon" />
                </Link>
              ) : (
                <a className="pillBtn" href="#" aria-label={`${cat.button}`}>
                  <span>{cat.button}</span>
                  <IconArrowRight className="pillBtn__icon" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import whiteBag from "../assets/plain-white.svg";
import blackBag from "../assets/plain-black.svg";
import pinkBag from "../assets/plain-pink.svg";
import purpleBag from "../assets/plain-purple.svg";
import { Link } from "react-router-dom";

const cards = [
  { title: "White Courier Bags", image: whiteBag, href: "/white-courier-bags" },
  { title: "Black Courier Bags", image: blackBag },
  { title: "Pink Courier Bags", image: pinkBag },
  { title: "Purple Courier Bags", image: purpleBag },
];

export default function PlainCourierBagsPage() {
  return (
    <section className="plainPage" aria-label="Plain courier bags">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Plain Courier Bags</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="plainGrid" aria-label="Plain courier bag categories">
          {cards.map((c) => (
            <article key={c.title} className="plainCard">
              <div className="plainCard__imgWrap">
                <img className="plainCard__img" src={c.image} alt={c.title} loading="lazy" />
              </div>
              {c.href ? (
                <Link className="plainCard__btn" to={c.href} aria-label={c.title}>
                  {c.title}
                </Link>
              ) : (
                <a className="plainCard__btn" href="#" aria-label={c.title}>
                  {c.title}
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="plainInfo" aria-label="Plain courier bags information">
          <p>
            We Live In A World Of Express Deliveries. A Shipment And Delivery Going Wrong Leaves With Dissatisfied
            Customers And Massive Financial Losses. So, How Can You Ensure A Secure And Hassle-Free Shipping Experience?
          </p>
          <p>
            The Answer Lies With A Wide Range Of{" "}
            <a className="inlineLink" href="#">
              Plain Courier Bags
            </a>{" "}
            By ARK Packaging. Whatever Your Needs – Our Packaging Materials Address All Your Shipping Worries.
          </p>
          <p>
            We Are One Of The Leading Names In The Industry, Offering An Extensive Range Of Plain Shipping Packaging
            Materials.
          </p>
          <button className="plainReadMore" type="button">
            Read More
          </button>
        </div>
      </div>
    </section>
  );
}

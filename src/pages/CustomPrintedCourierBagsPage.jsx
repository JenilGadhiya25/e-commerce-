import { Link } from "react-router-dom";
import { customPrintedCourierBagsCatalog } from "../products/catalog.js";

export default function CustomPrintedCourierBagsPage() {
  return (
    <section className="plainPage" aria-label="Custom printed courier bags">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Custom Printed Courier Bags</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="plainGrid" aria-label="Custom printed courier bag styles">
          {customPrintedCourierBagsCatalog.map((c) => (
            <article key={c.title} className="plainCard">
              <div className="plainCard__imgWrap">
                <img className="plainCard__img" src={c.image} alt={c.title} loading="lazy" />
              </div>
              {c.href && c.href !== "#" ? (
                <Link className="plainCard__btn" to={c.href} aria-label={c.title}>
                  {c.title}
                </Link>
              ) : (
                <a className="plainCard__btn" href="#" aria-label={c.title} onClick={(e) => e.preventDefault()}>
                  {c.title}
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="plainInfo" aria-label="Custom printed courier bags information">
          <p>
            Though A Simple Ritual, Opening/Unboxing A Package Can Make A Huge Impact On Buyers’ Purchasing Journey.
          </p>
          <p>
            So, It’s Important To Get The Packaging Right. And There Can’t Be A Better Way To Deliver A Seamless Customer
            Experience Than A{" "}
            <a className="inlineLink" href="#">
              Custom Printed
            </a>{" "}
            Packaging Solution.
          </p>
          <p>
            If You Are Looking For A Professional And Impressive Look For Your Ecommerce Packages, Contact ARK Packaging.
          </p>
          <p>We Are A Leading Manufacturer With Expertise In Producing The Best-Quality Custom-Printed Courier Bags.</p>
          <button className="plainReadMore" type="button">
            Read More
          </button>
        </div>
      </div>
    </section>
  );
}

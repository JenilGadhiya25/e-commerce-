import whiteFloral from "../assets/info-white-floral.svg";
import purpleHey from "../assets/info-purple-hey.svg";
import pinkPretty from "../assets/info-pink-pretty.svg";
import blackRibbon from "../assets/info-black-ribbon.svg";
import { IconArrowRight } from "./icons/Icons.jsx";

export default function PrintsBannerSection() {
  return (
    <section className="printsBanner" aria-label="Stylish prints promo">
      <div className="container printsBanner__inner">
        <div className="printsBanner__left">
          <h2 className="printsBanner__title">
            Stylish Prints
            <br />
            That Make
            <br />
            Every Delivery
            <br />
            Special!
          </h2>

          <a className="printsBanner__cta" href="#" aria-label="Discover more prints">
            <span>Discover More Prints</span>
            <IconArrowRight className="printsBanner__ctaIcon" />
          </a>
        </div>

        <div className="printsBanner__right" aria-label="Printed courier bag showcase">
          <div className="printsShowcase">
            <div className="printsShowcase__ped printsShowcase__ped--left" aria-hidden="true" />
            <div className="printsShowcase__ped printsShowcase__ped--mid" aria-hidden="true" />
            <div className="printsShowcase__ped printsShowcase__ped--right" aria-hidden="true" />

            <img className="printsBag printsBag--purple" src={purpleHey} alt='Purple courier bag: "Hey there!! I have arrived!"' />
            <img className="printsBag printsBag--white" src={whiteFloral} alt="White printed courier bag with floral design" />
            <img className="printsBag printsBag--black" src={blackRibbon} alt="Black courier bag with ribbon illustration" />
            <img className="printsBag printsBag--pink" src={pinkPretty} alt='Pink courier bag: "Pretty Thing Inside"' />
          </div>
        </div>
      </div>
    </section>
  );
}


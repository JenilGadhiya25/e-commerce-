import bagUrl from "../assets/pink-courier-bag.svg";
import { IconDrop, IconShieldThumb, IconTear } from "./icons/Icons.jsx";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="heroLeft">
          <h1 className="heroTitle">
            SHIP IN STYLE WITH
            <br />
            ARK PACKAGING
          </h1>
          <p className="heroDesc">Stand out with unique designs that reflect your brand!</p>
          <div className="heroCtas">
            <a className="btn btn--primary" href="#">
              Shop Now
            </a>
            <a className="btn btn--ghost" href="#">
              Explore Categories
            </a>
          </div>
        </div>

        <div className="heroCenter">
          <div className="bagWrap" aria-label="Premium pink courier bag">
            <img className="bagImg" src={bagUrl} alt="Pink courier bag" />
            <div className="sticker" aria-label="Premium Bags">
              <span className="sticker__top">PREMIUM</span>
              <span className="sticker__bottom">Bags!</span>
            </div>
          </div>
        </div>

        <div className="heroRight" aria-label="Key product features">
          <Feature
            icon={<IconShieldThumb />}
            title="100% Durable"
            description="Built for daily shipping & handling."
          />
          <Feature
            icon={<IconDrop />}
            title="Water Resistant"
            description="Protects parcels from splashes."
          />
          <Feature
            icon={<IconTear />}
            title="Tear Resistant"
            description="Strong film that resists rips."
          />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="feature">
      <div className="feature__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="feature__text">
        <div className="feature__title">{title}</div>
        <div className="feature__desc">{description}</div>
      </div>
    </div>
  );
}


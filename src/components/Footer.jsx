import { IconLocation, IconMail, IconPhone, IconWhatsapp } from "./icons/Icons.jsx";
import { Link } from "react-router-dom";
import arkLogo from "../assets/ark-logo.png";

const productLinks = [
  "Home",
  "Plain Courier Bags",
  "Custom Printed Courier Bags",
  "Printed Courier Bag",
  "Frosted Zipper Bags",
];

const knowLinks = ["About", "Contact Us", "Blog", "Sitemap"];

const supportLinks = ["Privacy Policy", "Shipping & Return", "Cancellation Policy", "Order Tracking", "Sitemap"];

export default function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container">
        <div className="newsletter" aria-label="Newsletter subscription">
          <input className="newsletter__input" type="email" placeholder="Email" aria-label="Email" />
          <button className="newsletter__btn" type="button">
            Send
          </button>
        </div>

        <div className="footerGrid">
          <div className="footerCol footerCol--company">
            <Link className="footerLogo" to="/" aria-label="ARK Packaging Enterprise Home">
              <img className="footerLogo__img" src={arkLogo} alt="ARK Packaging Enterprise" />
            </Link>

            <div className="footerInfo">
              <div className="footerRow">
                <IconLocation className="footerRow__icon" />
                <div className="footerRow__text">
                  Shop No. 113, 1st Floor, Royal Business Hub,
                  <br />
                  Near DD Sports Circle,
                  <br />
                  Variav, Surat – 394107,
                  <br />
                  Gujarat, India
                </div>
              </div>

              <a className="footerRow footerRow--link" href="tel:+918200421794">
                <IconPhone className="footerRow__icon" />
                <span className="footerRow__text">+91 8200421794</span>
              </a>

              <a className="footerRow footerRow--link" href="mailto:sales@arkpackagingenterprise.in">
                <IconMail className="footerRow__icon" />
                <span className="footerRow__text">sales@arkpackagingenterprise.in</span>
              </a>
            </div>
          </div>

          <FooterLinks title="Product & Services" links={productLinks} />
          <FooterLinks title="Get to Know Us" links={knowLinks} />
          <FooterLinks title="Support & Legal" links={supportLinks} />
        </div>

        <div className="footerBottom">
          <span>© {new Date().getFullYear()} ARK Packaging Enterprise. All rights reserved.</span>
          <Link className="footerAdminBtn" to="/admin/login" aria-label="Admin Panel">
            Admin Panel
          </Link>
        </div>
      </div>

      <a
        className="whatsappFloat"
        href="https://wa.me/918200421794"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp Support"
      >
        <IconWhatsapp className="whatsappFloat__icon" />
      </a>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div className="footerCol">
      <div className="footerHeading">{title}</div>
      <ul className="footerLinks">
        {links.map((label) => (
          <li key={label}>
            <a className="footerLink" href="#">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

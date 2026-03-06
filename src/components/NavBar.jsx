import { IconChevronDown, IconPhone } from "./icons/Icons.jsx";

const items = [
  { label: "Courier Bags", dropdown: true },
  { label: "Custom Printed Courier Bags", dropdown: true },
  { label: "Printed Courier Bag", dropdown: false },
  { label: "Frosted Zipper Bags", dropdown: true },
];

export default function NavBar() {
  return (
    <nav className="nav" aria-label="Primary">
      <div className="container nav__inner">
        <ul className="nav__menu">
          {items.map((item) => (
            <li key={item.label} className={item.dropdown ? "navItem navItem--dd" : "navItem"}>
              <a className="navLink" href="#">
                <span>{item.label}</span>
                {item.dropdown ? <IconChevronDown className="navChevron" /> : null}
              </a>
              {item.dropdown ? (
                <div className="dropdown" role="menu" aria-label={`${item.label} submenu`}>
                  <a href="#" className="dropdown__link" role="menuitem">
                    All {item.label}
                  </a>
                  <a href="#" className="dropdown__link" role="menuitem">
                    Best Sellers
                  </a>
                  <a href="#" className="dropdown__link" role="menuitem">
                    New Arrivals
                  </a>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <a className="nav__contact" href="tel:+918200421794" aria-label="Call ARK Packaging">
          <IconPhone className="nav__phoneIcon" />
          <span className="nav__phoneText">+91 82004 21794</span>
        </a>
      </div>
    </nav>
  );
}


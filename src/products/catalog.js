const frostedPlain = "/products/product-frosted-plain.svg";
const frostedPrinted = "/products/product-frosted-printed.svg";
const printedPink = "/products/info-pink-pretty.svg";
const printedPurple = "/products/info-purple-hey.svg";
const printedWhite = "/products/info-white-floral.svg";
const printedBlack = "/products/info-black-ribbon.svg";

const customWhite = "/products/custom-printed-white.svg";
const customBlack = "/products/custom-printed-black.svg";
const customPink = "/products/custom-printed-pink.svg";
const customPurple = "/products/custom-printed-purple.svg";

export const bestSellersCatalog = [
  {
    id: "plain-frosted-6x8",
    title: "6 X 8 Inch Plain Frosted Zipper Bags",
    image: frostedPlain,
    original: 23.28,
    price: 19.4,
    kind: "standard",
  },
  {
    id: "plain-frosted-14x18",
    title: "14 X 18 Inch Plain Frosted Zipper Bags",
    image: frostedPlain,
    original: 31.9,
    price: 26.55,
    kind: "standard",
  },
  {
    id: "plain-frosted-10x12",
    title: "10 X 12 Inch Plain Frosted Zipper Bags",
    image: frostedPlain,
    original: 27.75,
    price: 22.8,
    kind: "standard",
  },
  {
    id: "plain-frosted-8x10",
    title: "8 X 10 Inch Plain Frosted Zipper Bags",
    image: frostedPlain,
    original: 25.4,
    price: 20.9,
    kind: "standard",
  },
  {
    id: "custom-frosted-slider",
    title: "Custom Printed Frosted Slider Bags",
    image: frostedPrinted,
    original: 44.0,
    price: 36.9,
    kind: "custom",
    rating: 5,
    href: "/product/custom-printed-frosted-slider-zipper-lock-bags",
  },
  {
    id: "custom-pink-courier",
    title: "Custom Printed Pink Courier Bags",
    image: printedPink,
    original: 52.0,
    price: 41.0,
    kind: "custom",
    rating: 5,
    href: "/product/custom-printed-pink-courier-bags-60-micron",
  },
  {
    id: "custom-purple-courier",
    title: "Custom Printed Purple Courier Bags",
    image: printedPurple,
    original: 52.0,
    price: 41.0,
    kind: "custom",
    rating: 5,
    href: "/product/custom-printed-purple-courier-bags-60-micron",
  },
  {
    id: "custom-white-courier",
    title: "Custom Printed White Courier Bags",
    image: printedWhite,
    original: 52.0,
    price: 41.0,
    kind: "custom",
    rating: 5,
    href: "/product/custom-printed-white-courier-bags-51-micron",
  },
  {
    id: "custom-black-courier",
    title: "Custom Printed Black Courier Bags",
    image: printedBlack,
    original: 52.0,
    price: 41.0,
    kind: "custom",
    rating: 5,
    href: "/product/custom-printed-black-courier-covers-60-micron",
  },
];

export const customPrintedCourierBagsCatalog = [
  { id: "custom-printed-white", title: "Custom Printed White Courier Bag", image: customWhite, href: "/product/custom-printed-white-courier-bags-51-micron" },
  { id: "custom-printed-black", title: "Custom Printed Black Courier Bag", image: customBlack, href: "/product/custom-printed-black-courier-covers-60-micron" },
  { id: "custom-printed-pink", title: "Custom Printed Pink Courier Bag", image: customPink, href: "/product/custom-printed-pink-courier-bags-60-micron" },
  { id: "custom-printed-purple", title: "Custom Printed Purple Bag", image: customPurple, href: "/product/custom-printed-purple-courier-bags-60-micron" },
];

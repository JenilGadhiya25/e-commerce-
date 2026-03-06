export default function AnnouncementBar() {
  return (
    <div className="announcement">
      <div className="container announcement__inner">
        <span>COD Available On Non-Printing Orders ₹4000.</span>
        <span className="announcement__dot" aria-hidden="true">
          •
        </span>
        <span>Non-Printing: Dispatch Next Day.</span>
        <span className="announcement__dot" aria-hidden="true">
          •
        </span>
        <span>Printing: Delivery In 15 Days.</span>
      </div>
    </div>
  );
}


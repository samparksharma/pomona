import Navbar from "../components/layout/Navbar";
import "./NewsletterConfirmed.css";

function NewsletterConfirmed() {
  return (
    <main className="newsletter-confirmed">
      <Navbar light />

      <section className="newsletter-confirmed-card">
        <span className="newsletter-confirmed-eyebrow">
          Pomona Newsletter
        </span>

        <h1>Subscription confirmed.</h1>

        <p>
          You're officially subscribed.
          You can now close this tab.
        </p>
      </section>
    </main>
  );
}

export default NewsletterConfirmed;
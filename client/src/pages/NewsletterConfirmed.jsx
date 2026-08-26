import "./NewsletterConfirmed.css";

function NewsletterConfirmed() {
  return (
    <main className="newsletter-confirmed">
      <section className="newsletter-confirmed-card">
        <span className="newsletter-confirmed-eyebrow">
          Sampark's Newsletter
        </span>

        <h1>Subscription confirmed.</h1>

        <p>
          You're officially subscribed.
          <br />
          You can now close this tab.
        </p>
      </section>
    </main>
  );
}

export default NewsletterConfirmed;
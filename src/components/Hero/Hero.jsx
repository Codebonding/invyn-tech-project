import "../Hero/Hero.css";
import heroVideo from '../../assets/videos/back2.mp4';

function Hero() {
  return (
    <section className="invyn-hero">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark + Blue Overlay */}
      <div className="hero-overlay"></div>

      {/* Content */}
      <div className="container hero-content">
        <div className="row align-items-center min-vh-100">

          <div className="col-lg-8">

            <span className="hero-badge">
              INNOVATION • TECHNOLOGY • FUTURE
            </span>

            <h1>
              Build. Innovate.
              <span> Transform.</span>
            </h1>

            <p>
              Empowering businesses and learners with modern
              technology, AI solutions and industry-focused
              digital experiences.
            </p>

            <div className="hero-buttons">

              <a href="/contact" className="hero-btn primary">
                Get Started
              </a>

              <a href="/courses" className="hero-btn glass">
                Explore Courses
              </a>

            </div>

          </div>

        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="hero-bottom-fade"></div>

    </section>
  );
}

export default Hero;
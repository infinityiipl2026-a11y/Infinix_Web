const About = () => {
  return (
    <div className="container section">

      <div className="about-page">

        <h1 className="page-title">
          About Infinity CPD
        </h1>

        <p className="about-intro">
          Infinity CPD is committed to delivering
          high-quality consumer products that enhance
          everyday life. Our focus is on innovation,
          quality, and customer satisfaction.
        </p>

        <div className="about-grid">

          <div className="about-card">
            <h2>Our Vision</h2>
            <p>
              To become a trusted household name by
              providing reliable and innovative
              products that improve daily living.
            </p>
          </div>

          <div className="about-card">
            <h2>Our Mission</h2>
            <p>
              To offer premium-quality products while
              maintaining customer trust, affordability,
              and excellence.
            </p>
          </div>

          <div className="about-card">
            <h2>Quality First</h2>
            <p>
              Every product undergoes strict quality
              checks to ensure customer satisfaction.
            </p>
          </div>

          <div className="about-card">
            <h2>Customer Focus</h2>
            <p>
              We believe long-term relationships are
              built through trust and service.
            </p>
          </div>

        </div>

        {/* PREVIOUS FRANCHISEE SECTION */}

        <section className="franchisee-section">

          <h2 className="section-title">
            Previous Franchisee Associations
          </h2>

          <div className="franchisee-grid">

            <div className="franchisee-card">

              <img
                src="/images/frozen.jpg"
                alt="Disney Frozen"
              />

              <h3>Disney Frozen</h3>

              <p>
                Infinity Industries Pvt. Ltd. proudly
                associated with Disney Frozen under an
                official licensing arrangement, bringing
                the magic of Elsa and Anna to children
                through a range of personal care and
                lifestyle products.
              </p>

            </div>

            <div className="franchisee-card">

              <img
                src="/images/mickey.jpg"
                alt="Mickey & Friends"
              />

              <h3>Mickey & Friends</h3>

              <p>
                Through our association with Mickey &
                Friends, we introduced a vibrant
                collection of products inspired by
                Disney's most beloved characters,
                creating fun and engaging experiences
                for children and families.
              </p>

            </div>

            <div className="franchisee-card">

              <img
                src="/images/spiderman.jpg"
                alt="Marvel Spider-Man"
              />

              <h3>Marvel Spider-Man</h3>

              <p>
                Our collaboration with Marvel
                Spider-Man allowed us to offer products
                inspired by one of the world's most
                iconic superheroes, connecting with
                young consumers through adventure and
                excitement.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default About;

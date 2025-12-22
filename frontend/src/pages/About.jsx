const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About TravelApp</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connecting travelers with experienced local guides for unforgettable adventures around the world.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                We believe that the best way to experience a destination is through the eyes of a local. 
                Our platform connects passionate travelers with knowledgeable guides who bring destinations to life.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 2024, TravelApp has grown to become the trusted platform for authentic travel experiences, 
                supporting local communities and creating meaningful connections.
              </p>
              <p className="text-lg text-gray-600">
                Whether you're seeking adventure, culture, or relaxation, our verified guides ensure 
                safe, memorable, and personalized journeys.
              </p>
            </div>
            <div className="bg-blue-100 rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600">Verified Guides</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">50+</div>
                  <div className="text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">10K+</div>
                  <div className="text-gray-600">Happy Travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">4.9/5</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-4">Trust & Safety</h3>
              <p className="text-gray-600">
                All guides are verified and reviewed. Your safety is our priority with 24/7 support.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold mb-4">Authentic Experiences</h3>
              <p className="text-gray-600">
                Local guides share hidden gems and cultural insights you won't find in guidebooks.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-2xl font-bold mb-4">Community Support</h3>
              <p className="text-gray-600">
                Supporting local economies by connecting travelers directly with community guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👨‍💼
              </div>
              <h3 className="text-xl font-bold">John Doe</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👩‍💼
              </div>
              <h3 className="text-xl font-bold">Jane Smith</h3>
              <p className="text-gray-600">Head of Operations</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👨‍💻
              </div>
              <h3 className="text-xl font-bold">Mike Johnson</h3>
              <p className="text-gray-600">Lead Developer</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👩‍🎨
              </div>
              <h3 className="text-xl font-bold">Sarah Williams</h3>
              <p className="text-gray-600">Head of Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8">
            Whether you're a traveler or a guide, become part of our global community today.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Start Exploring
            </a>
            <a href="/apply-guide" className="bg-blue-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors">
              Become a Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

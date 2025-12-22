const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">✈️ TravelApp</h3>
            <p className="text-gray-400">
              Your trusted travel companion. Book guides, explore destinations, and create unforgettable memories.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/guides" className="text-gray-400 hover:text-white">Browse Guides</a></li>
              <li><a href="/destinations" className="text-gray-400 hover:text-white">Destinations</a></li>
              <li><a href="/hotels" className="text-gray-400 hover:text-white">Hotels</a></li>
              <li><a href="/packages" className="text-gray-400 hover:text-white">Packages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Become a Guide</h4>
            <p className="text-gray-400 mb-4">
              Share your expertise and earn money by guiding travelers.
            </p>
            <a href="/apply-guide" className="btn-primary">
              Apply Now
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 TravelApp. All rights reserved. Final Year Project.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

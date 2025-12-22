import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with experienced local guides and explore the world like never before.
          </p>

          {!user ? (
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/guides" className="btn-secondary text-lg px-8 py-3">
                Browse Guides
              </Link>
            </div>
          ) : (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'guide' ? '/guide/dashboard' : '/dashboard'}
              className="btn-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-2">Expert Guides</h3>
              <p className="text-gray-600">
                Connect with verified local guides who know the best spots
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden fees
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Verified Reviews</h3>
              <p className="text-gray-600">
                Read real reviews from travelers like you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Become a Guide</h2>
          <p className="text-xl mb-8">
            Share your expertise and earn money by guiding travelers
          </p>
          <Link to="/apply-guide" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

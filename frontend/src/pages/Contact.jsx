import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send to backend
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-800 via-blue-800 to-indigo-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-6 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <div className="text-6xl mb-6">📞</div>
          <h1 className="text-5xl font-bold mb-6">Contact Nepal Travel & Tourism</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Planning your Nepal adventure? Our team of local experts is here to help you create unforgettable memories in the Himalayas.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch with Nepal Experts</h2>
              <p className="text-gray-600 mb-8">
                Whether you're planning an Everest trek, cultural tour of Kathmandu, or wildlife safari in Chitwan,
                our Nepal-based team will help you create the perfect Himalayan adventure.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <h3 className="font-bold text-lg">Email Us</h3>
                    <p className="text-gray-600">info@nepaltravel.com.np</p>
                    <p className="text-gray-600">support@nepaltravel.com.np</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📞</div>
                  <div>
                    <h3 className="font-bold text-lg">Call/WhatsApp</h3>
                    <p className="text-gray-600">+977-1-1234567</p>
                    <p className="text-gray-600">+977-980-1234567 (WhatsApp)</p>
                    <p className="text-sm text-gray-500 mt-1">Available 6 AM - 10 PM NPT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📍</div>
                  <div>
                    <h3 className="font-bold text-lg">Our Office</h3>
                    <p className="text-gray-600">Thamel, Kathmandu 44600</p>
                    <p className="text-gray-600">Nepal</p>
                    <p className="text-sm text-gray-500 mt-1">Located in the heart of tourist district</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🕐</div>
                  <div>
                    <h3 className="font-bold text-lg">Operating Hours</h3>
                    <p className="text-gray-600">Sunday - Friday: 6:00 AM - 10:00 PM</p>
                    <p className="text-gray-600">Saturday: 7:00 AM - 9:00 PM</p>
                    <p className="text-sm text-gray-500 mt-1">Nepal Time (NPT)</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Follow Our Nepal Adventures</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-4xl hover:opacity-70 transition-opacity" title="Facebook">📘</a>
                  <a href="#" className="text-4xl hover:opacity-70 transition-opacity" title="Instagram">📷</a>
                  <a href="#" className="text-4xl hover:opacity-70 transition-opacity" title="Twitter">🐦</a>
                  <a href="#" className="text-4xl hover:opacity-70 transition-opacity" title="LinkedIn">💼</a>
                </div>
                <p className="text-sm text-gray-500 mt-3">#NepalTravel #HimalayanAdventures</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {submitted && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="input-field"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    className="input-field"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button type="submit" className="w-full btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nepal Travel FAQs
          </h2>
          <div className="space-y-6">
            <details className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                🌄 Do I need special permits for trekking in Nepal?
              </summary>
              <p className="mt-4 text-gray-600">
                Yes, most popular trekking routes require permits. Our guides will help you obtain the necessary
                TIMS (Trekkers' Information Management System) cards and park entry permits. We handle all
                paperwork for popular routes like Everest Base Camp, Annapurna Circuit, and Langtang Valley.
              </p>
            </details>

            <details className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                🏔️ What's the best time to visit Nepal?
              </summary>
              <p className="mt-4 text-gray-600">
                Nepal has four distinct seasons: Spring (March-May) for rhododendron blooms, Summer (June-August)
                for monsoon rains, Autumn (September-November) for clear mountain views, and Winter (December-February)
                for mild weather. Autumn is most popular for trekking with stable weather and visibility.
              </p>
            </details>

            <details className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                💉 What vaccinations do I need for Nepal?
              </summary>
              <p className="mt-4 text-gray-600">
                Routine vaccinations are recommended. Hepatitis A, Typhoid, and Rabies are advised for most travelers.
                Japanese Encephalitis is recommended for those spending extended time in rural areas. Consult your
                doctor 4-6 weeks before travel. Our guides can recommend local clinics if needed.
              </p>
            </details>

            <details className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                🏕️ How do I book accommodations in Nepal?
              </summary>
              <p className="mt-4 text-gray-600">
                Browse our curated selection of hotels, teahouses, and lodges across Nepal. From luxury resorts in
                Pokhara to traditional teahouses on trekking routes, our guides ensure authentic, safe accommodations
                that match your preferences and budget.
              </p>
            </details>

            <details className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-lg border border-pink-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                🍛 Can you arrange vegetarian/vegan food in Nepal?
              </summary>
              <p className="mt-4 text-gray-600">
                Absolutely! Nepal offers excellent vegetarian and vegan cuisine. Dal Bhat (lentils and rice) is a
                traditional vegetarian dish. Our guides work with local restaurants and teahouses to ensure you
                have delicious, authentic Nepali vegetarian meals throughout your journey.
              </p>
            </details>

            <details className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-100">
              <summary className="font-bold text-lg cursor-pointer text-gray-900">
                💰 What's the currency and best way to handle money?
              </summary>
              <p className="mt-4 text-gray-600">
                Nepalese Rupee (NPR) is the local currency. USD and Euros are widely accepted in tourist areas.
                ATMs are available in cities, but carry some cash for rural areas. Our guides can help exchange
                currency and recommend reliable money changers.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

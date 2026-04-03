const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Everest Base Camp: A Complete Trekker's Guide",
      excerpt: "Everything you need to know about Nepal's most famous trek - from preparation to the breathtaking summit view.",
      author: "Pasang Sherpa",
      date: "Dec 18, 2024",
      category: "Trekking",
      image: "🏔️",
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "Monsoon Trekking in Nepal: Is It Worth It?",
      excerpt: "Discover why the rainy season could be perfect for your Nepal adventure with fewer crowds and lush landscapes.",
      author: "Lila Thapa",
      date: "Dec 15, 2024",
      category: "Seasonal Travel",
      image: "🌧️",
      readTime: "6 min read"
    },
    {
      id: 3,
      title: "Hidden Gems: Beyond Kathmandu and Pokhara",
      excerpt: "Explore Nepal's lesser-known destinations that offer authentic cultural experiences and natural beauty.",
      author: "Raju Gurung",
      date: "Dec 12, 2024",
      category: "Hidden Gems",
      image: "🏞️",
      readTime: "7 min read"
    },
    {
      id: 4,
      title: "Nepali Cuisine: A Food Lover's Journey",
      excerpt: "From momo to dal bhat, discover the flavors that make Nepali cuisine unique and delicious.",
      author: "Sunita Rai",
      date: "Dec 10, 2024",
      category: "Food & Culture",
      image: "🍛",
      readTime: "5 min read"
    },
    {
      id: 5,
      title: "Wildlife Photography in Chitwan National Park",
      excerpt: "Tips and techniques for capturing stunning wildlife photos of rhinos, tigers, and birds in Nepal's jungle.",
      author: "Binod Lama",
      date: "Dec 8, 2024",
      category: "Wildlife",
      image: "📸",
      readTime: "6 min read"
    },
    {
      id: 6,
      title: "Spiritual Nepal: Pilgrimage Sites and Meditation Retreats",
      excerpt: "Explore Nepal's sacred sites, monasteries, and meditation centers for spiritual awakening.",
      author: "Tenzin Dolma",
      date: "Dec 5, 2024",
      category: "Spirituality",
      image: "🙏",
      readTime: "9 min read"
    },
    {
      id: 7,
      title: "Nepal's Indigenous Communities: A Cultural Journey",
      excerpt: "Learn about Nepal's diverse ethnic groups and their unique traditions, festivals, and way of life.",
      author: "Suman Thakuri",
      date: "Dec 3, 2024",
      category: "Culture",
      image: "🎭",
      readTime: "7 min read"
    },
    {
      id: 8,
      title: "Budget Trekking: Affordable Adventures in Nepal",
      excerpt: "How to experience Nepal's mountains without breaking the bank - tips from local experts.",
      author: "Niraj Shrestha",
      date: "Dec 1, 2024",
      category: "Budget Travel",
      image: "🎒",
      readTime: "5 min read"
    }
  ];

  const categories = ["All", "Trekking", "Culture", "Food & Culture", "Wildlife", "Hidden Gems", "Seasonal Travel", "Spirituality", "Budget Travel"];

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
          <div className="text-6xl mb-6">📖</div>
          <h1 className="text-5xl font-bold mb-6">Nepal Travel Stories & Guides</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Authentic insights, trekking tips, and cultural stories from Nepal's local experts and adventurous travelers
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  idx === 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Post</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-100 flex items-center justify-center p-12">
                <div className="text-9xl">{blogPosts[0].image}</div>
              </div>
              <div className="md:w-1/2 p-8">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">{blogPosts[0].category}</span>
                <h3 className="text-3xl font-bold mt-4 mb-4">{blogPosts[0].title}</h3>
                <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>👤 {blogPosts[0].author}</span>
                    <span>📅 {blogPosts[0].date}</span>
                    <span>⏱️ {blogPosts[0].readTime}</span>
                  </div>
                </div>
                <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Read More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Latest Posts</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-blue-100 h-48 flex items-center justify-center">
                  <div className="text-7xl">{post.image}</div>
                </div>
                <div className="p-6">
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">{post.category}</span>
                  <h3 className="text-xl font-bold mt-3 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>👤 {post.author}</span>
                    <span>📅 {post.date}</span>
                  </div>
                  <button className="text-blue-600 font-medium hover:text-blue-700">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-800 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-6 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="text-6xl mb-6">🇳🇵</div>
          <h2 className="text-4xl font-bold mb-6">Stay Connected with Nepal</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get insider tips on trekking routes, festival updates, weather forecasts, and exclusive deals for your Nepal adventure.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="your.email@example.com"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-r-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              Subscribe
            </button>
          </div>
          <p className="text-sm mt-4 opacity-90">
            Join 5,000+ travelers who discover Nepal's magic every month! 📧
          </p>
        </div>
      </section>
    </div>
  );
};

export default Blog;

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Travel Destinations for 2024",
      excerpt: "Discover the most exciting places to visit this year, from hidden gems to popular hotspots.",
      author: "Sarah Johnson",
      date: "Dec 15, 2024",
      category: "Travel Tips",
      image: "🏖️",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "How to Choose the Perfect Travel Guide",
      excerpt: "Learn what to look for when selecting a guide for your next adventure.",
      author: "Mike Chen",
      date: "Dec 12, 2024",
      category: "Guide Tips",
      image: "🗺️",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Sustainable Travel: A Beginner's Guide",
      excerpt: "Make your travels more eco-friendly with these simple tips and practices.",
      author: "Emma Davis",
      date: "Dec 10, 2024",
      category: "Sustainability",
      image: "🌱",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Cultural Etiquette Around the World",
      excerpt: "Understanding local customs and traditions to be a respectful traveler.",
      author: "David Kim",
      date: "Dec 8, 2024",
      category: "Culture",
      image: "🌏",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Budget Travel Hacks You Need to Know",
      excerpt: "Save money on your next trip with these insider tips from experienced travelers.",
      author: "Lisa Anderson",
      date: "Dec 5, 2024",
      category: "Budget Travel",
      image: "💰",
      readTime: "5 min read"
    },
    {
      id: 6,
      title: "The Rise of Solo Travel: Why It's Worth It",
      excerpt: "Exploring the benefits and tips for traveling alone and making the most of it.",
      author: "Tom Wilson",
      date: "Dec 1, 2024",
      category: "Solo Travel",
      image: "🎒",
      readTime: "6 min read"
    }
  ];

  const categories = ["All", "Travel Tips", "Guide Tips", "Culture", "Budget Travel", "Solo Travel", "Sustainability"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Travel Blog</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Tips, stories, and inspiration from travelers and guides around the world
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
                className={idx === 0 ? "badge badge-info px-4 py-2" : "badge bg-gray-200 text-gray-700 px-4 py-2"}
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
          <div className="card overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-blue-100 flex items-center justify-center p-12">
                <div className="text-9xl">{blogPosts[0].image}</div>
              </div>
              <div className="md:w-1/2 p-8">
                <span className="badge badge-info">{blogPosts[0].category}</span>
                <h3 className="text-3xl font-bold mt-4 mb-4">{blogPosts[0].title}</h3>
                <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>👤 {blogPosts[0].author}</span>
                    <span>📅 {blogPosts[0].date}</span>
                    <span>⏱️ {blogPosts[0].readTime}</span>
                  </div>
                </div>
                <button className="mt-6 btn-primary">Read More</button>
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
              <div key={post.id} className="card overflow-hidden animate-fadeIn">
                <div className="bg-blue-100 h-48 flex items-center justify-center">
                  <div className="text-7xl">{post.image}</div>
                </div>
                <div className="p-6">
                  <span className="badge badge-info text-xs">{post.category}</span>
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
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Subscribe to Our Newsletter</h2>
          <p className="text-xl mb-8">
            Get travel tips, stories, and exclusive deals delivered to your inbox every week.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900"
            />
            <button className="bg-blue-800 px-6 py-3 rounded-r-lg font-medium hover:bg-blue-900">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;

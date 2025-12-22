const ComingSoon = ({ title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">
          This page is under construction and will be available soon!
        </p>
        <p className="text-sm text-gray-500">
          The authentication is working. Test by logging in!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;

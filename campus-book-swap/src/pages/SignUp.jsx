const SignUp = () => {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <input type="text" id="name" name="name" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input type="email" id="email" name="email" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium">Password</label>
          <input type="password" id="password" name="password" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

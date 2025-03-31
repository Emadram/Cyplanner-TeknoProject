const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-2xl">User</span>
            </div>
          </div>
          <div className="flex-grow">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Your Name"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="your.email@example.com"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block mb-1 font-medium">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  placeholder="Tell us about yourself"
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

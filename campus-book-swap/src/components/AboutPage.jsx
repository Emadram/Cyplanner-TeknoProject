import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">About CampusBookSwap</h1>
            <p className="text-xl text-blue-100">
              Connecting students to exchange knowledge and save money on textbooks.
            </p>
          </div>
        </div>
      </div>
      
      {/* Mission section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
              <p className="text-xl text-gray-600">
                CampusBookSwap was created to help students reduce the high cost of education 
                by providing a platform to buy, sell, swap, and borrow textbooks directly from 
                their peers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Save Money</h3>
                <p className="text-gray-600">
                  Students save an average of 60% on textbooks compared to buying new.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Swap Books</h3>
                <p className="text-gray-600">
                  Exchange books you no longer need for ones you do, creating a circular economy.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Build Community</h3>
                <p className="text-gray-600">
                  Connect with fellow students in your major and build a network of academic support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Story section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  CampusBookSwap was founded in 2022 by a group of university students who were frustrated 
                  with the high cost of textbooks and the limited options for selling them back.
                </p>
                <p className="text-gray-600 mb-4">
                  Starting at just one campus with a simple bulletin board, we've now grown to serve 
                  over 50 universities nationwide, helping thousands of students save money each semester.
                </p>
                <p className="text-gray-600">
                  Our platform is built by students, for students, with a deep understanding of the 
                  challenges of academic life and the financial pressures of higher education.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="University campus" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=Campus+Image';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How it works section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="border border-gray-200 rounded-lg p-6 pt-8 mt-5 h-full">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">List Your Books</h3>
                  <p className="text-gray-600">
                    Create an account and list books you want to sell, swap, or lend. Set your price or swap preferences.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="border border-gray-200 rounded-lg p-6 pt-8 mt-5 h-full">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Connect with Students</h3>
                  <p className="text-gray-600">
                    Browse available books or respond to listings. Message other students to arrange exchanges.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="border border-gray-200 rounded-lg p-6 pt-8 mt-5 h-full">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Exchange Books</h3>
                  <p className="text-gray-600">
                    Meet on campus to complete the transaction. Rate your experience and build your reputation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/signup" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Join Today
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-blue-200">Books Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">8,500+</div>
                <div className="text-blue-200">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$450,000+</div>
                <div className="text-blue-200">Student Savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-200">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Our Team</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { name: 'Alex Johnson', role: 'Founder & CEO', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
                { name: 'Sarah Chen', role: 'CTO', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { name: 'David Patel', role: 'Marketing Director', img: 'https://randomuser.me/api/portraits/men/67.jpg' },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img 
                      src={member.img} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/128x128?text=Team+Member';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-800">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Start Saving?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students who are already saving money and building connections on campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Sign Up Now
              </Link>
              <Link to="/books" className="px-8 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
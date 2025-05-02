import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AiLOGO from '../assets/images/IMG/aichatbotLOGO.png';

// Import shared data and components
import { 
  locationData, 
  eventsData, 
  API_KEYS, 
  getLocationsByTags 
} from '../data/SharedData';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import InterestSelector from '../components/chat/InterestSelector';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ChatTimeline from '../components/chat/ChatTimeline';
import MilestonesTimeline from '../components/chat/MilestonesTimeline';
import TravelLogistics from '../components/chat/TravelLogistics';
import { callGeminiAPI, processAIResponse } from '../utils/apiHelpers';

// Import extended destination data
import { 
  kyreniaLogistics,
  kyreniaMilestones,
  salamisMilestones,
  bellapaisMilestones,
  varoshaMilestones
} from '../data/DestinationData';

/**
 * AiChat component - Main chatbot interface with Cyprus travel assistance
 */
const AiChat = () => {
  // Create ref for message container and end element
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // State declarations with meaningful default values
  const [messages, setMessages] = useState([]);
  // Store timeline components separately
  const [timelineComponents, setTimelineComponents] = useState([]);
  const [interests, setInterests] = useState([
    { id: 1, name: 'Culture' },
    { id: 2, name: 'Food' },
    { id: 3, name: 'History' },
    { id: 4, name: 'Beaches' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    duration: 'Duration',
    budget: 'Budget',
    group: 'Group'
  });
  // Add state for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(true);
  // Add state for button tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  // Function to manually scroll to bottom when button is clicked
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Initial greeting message on component mount
  useEffect(() => {
    const initialGreeting = {
      id: 'greeting-1',
      sender: 'ai',
      text: "Hello! I'm your North Cyprus Travel Assistant. What kind of experience are you looking for?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialGreeting]);
    
    // Check if we're on mobile and hide sidebar initially
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
    
    // Add resize listener to handle responsive behavior
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarVisible(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Interest management functions
  const addInterest = useCallback((interestName) => {
    if (!interestName.trim()) return;
    
    const newId = interests.length > 0 
      ? Math.max(...interests.map(i => i.id)) + 1 
      : 1;
      
    setInterests(prev => [...prev, { id: newId, name: interestName.trim() }]);
  }, [interests]);
  
  const removeInterest = useCallback((id) => {
    setInterests(prev => prev.filter(interest => interest.id !== id));
  }, []);
  
  const clearAllInterests = useCallback(() => {
    setInterests([]);
  }, []);
  
  // Filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    setSelectedFilter(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);
  
  // Handle sending a message to the AI
  const handleSendMessage = useCallback(async (messageText) => {
    // Create and add user message to chat
    const newMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    
    // If we're on mobile, hide the sidebar to focus on the conversation
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
    
    try {
      // Get selected interests
      const selectedInterests = interests.map(i => i.name);
      
      // Get relevant locations based on interests
      const relevantLocations = getLocationsByTags(selectedInterests);
      
      // Format location information for the AI prompt
      const locationsInfo = relevantLocations.map(loc => 
        `${loc.name}: ${loc.description} Tags: ${loc.tags.join(', ')} Location: lat ${loc.lat}, lng ${loc.lng}`
      ).join('\n');
      
      // Format events information for the AI prompt
      const eventsInfo = eventsData.map(event => 
        `${event.name}: ${event.date}, ${event.price} at ${event.location}. ${event.description}`
      ).join('\n');
      
      // Build comprehensive prompt for Gemini
      const prompt = `You are a helpful Cyprus travel assistant. Be engaging and use emoji in your responses along with markdown formatting to emphasize key points.

      User interests: ${selectedInterests.join(', ')}
      Selected filters: Duration: ${selectedFilter.duration}, Budget: ${selectedFilter.budget}, Group: ${selectedFilter.group}
      Recent conversation: ${JSON.stringify(messages.slice(-3))}
      User query: ${messageText}
      
      Available destinations in North Cyprus:
      ${locationsInfo}
      
      Upcoming events in North Cyprus:
      ${eventsInfo}
      
      Important: 
      1. Continue the conversation naturally as if this is a follow-up.
      2. Include relevant emoji in your responses to make them engaging
      3. Use markdown for headers, bullet points, and to highlight important information
      4. Make suggestions based on user interests and filters
      5. If suggesting places, include emoji for the type of place (beach 🏖️, restaurant 🍽️, historical site 🏛️, etc.)
      6. Format your response in a clear, visually appealing way with markdown
      7. When mentioning specific destinations (like Salamis Ruins, Kyrenia Castle, Varosha, or Bellapais Abbey), mention that the user can click on the name to view it on the map
      8. When mentioning events, include the date and location
      9. If the user asks about travel routes, mention that they can use the Explore page to plan their journey
      10. Keep your response conversational, as if continuing a discussion already in progress`;
      
      // Call Gemini API
      const data = await callGeminiAPI({ prompt });
      
      // Extract and process the response text
      let responseText = "Sorry, I couldn't generate a response, Please try again.";
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        responseText = data.candidates[0].content.parts[0].text;
        // Process the response to add interactive elements
        responseText = processAIResponse(responseText, locationData, eventsData);
      }
      
      // Generate any timeline components based on the message content
      const newTimelineComponents = generateTimelineComponents(responseText);
      
      // Create and add AI response to chat
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Add timeline components as separate entries if any were generated
      if (newTimelineComponents.length > 0) {
        setTimelineComponents(prev => [
          ...prev,
          {
            id: `timeline-${Date.now()}`,
            parentMessageId: aiResponse.id,
            components: newTimelineComponents
          }
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Add error message to chat
      const errorResponse = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "I'm sorry, there was an error processing your request. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [interests, messages, selectedFilter]);
  
  // Filter option components
  const filterOptions = {
    duration: ['Duration', '1-3 days', '4-7 days', '1-2 weeks', '2+ weeks'],
    budget: ['Budget', 'Economy', 'Moderate', 'Luxury'],
    group: ['Group', 'Solo', 'Couple', 'Family', 'Friends']
  };
  
  // Render custom filter select component
  const renderFilterSelect = (type, options) => (
    <div className="relative">
      <select 
        value={selectedFilter[type]} 
        onChange={(e) => handleFilterChange(type, e.target.value)}
        className="w-full appearance-none bg-slate-700 bg-opacity-50 text-white rounded-full py-2 px-4 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );

  // Function to analyze response text and generate appropriate timeline components
  const generateTimelineComponents = (responseText) => {
    const components = [];
    
    // Check if response mentions specific destinations
    if (responseText.includes('Kyrenia Castle') || responseText.includes('Kyrenia Harbor')) {
      components.push({
        type: 'milestones',
        title: 'Kyrenia Castle & Harbor Highlights',
        data: kyreniaMilestones,
        destinationId: 'kyrenia'
      });
      
      components.push({
        type: 'logistics',
        title: 'Kyrenia Travel Logistics',
        data: kyreniaLogistics,
        destinationId: 'kyrenia'
      });
    }
    
    if (responseText.includes('Salamis Ruins') || responseText.includes('Salamis')) {
      components.push({
        type: 'milestones',
        title: 'Salamis Ruins Experience',
        data: salamisMilestones,
        destinationId: 'salamis'
      });
    }
    
    if (responseText.includes('Bellapais Abbey') || responseText.includes('Bellapais')) {
      components.push({
        type: 'milestones',
        title: 'Bellapais Abbey Visit',
        data: bellapaisMilestones,
        destinationId: 'bellapais'
      });
    }
    
    if (responseText.includes('Varosha') || responseText.includes('Ghost Town')) {
      components.push({
        type: 'milestones',
        title: 'Varosha Ghost Town Tour',
        data: varoshaMilestones,
        destinationId: 'varosha'
      });
    }
    
    return components;
  };

  // Create an interspersed timeline of messages and timeline components
  const createInterspersedTimeline = () => {
    // Create a combined timeline of messages and components
    const timeline = [...messages];
    
    // Insert timeline components after their related AI messages
    timelineComponents.forEach(timelineGroup => {
      // Find the index of the parent message
      const parentIndex = timeline.findIndex(item => item.id === timelineGroup.parentMessageId);
      
      // Check if we found the parent message
      if (parentIndex !== -1) {
        // Insert timeline components after parent message
        timelineGroup.components.forEach((component, i) => {
          timeline.splice(parentIndex + 1 + i, 0, {
            id: `${timelineGroup.id}-comp-${i}`,
            isTimelineComponent: true,
            component: component
          });
        });
      }
    });
    
    return timeline;
  };

  // Render a timeline component (milestone or logistics)
  const renderTimelineComponent = (item) => {
    const component = item.component;
    
    if (component.type === 'milestones') {
      return (
        <div className="w-full max-w-3xl mx-auto my-4 bg-slate-800 bg-opacity-40 rounded-xl p-4 border border-sky-900/30">
          <MilestonesTimeline 
            title={component.title}
            milestones={component.data}
            destinationId={component.destinationId}
          />
        </div>
      );
    } else if (component.type === 'logistics') {
      return (
        <div className="w-full max-w-3xl mx-auto my-4 bg-slate-800 bg-opacity-40 rounded-xl p-4 border border-sky-900/30">
          <TravelLogistics
            title={component.title}
            logistics={component.data}
            destinationId={component.destinationId}
          />
        </div>
      );
    }
    
    return null;
  };
  
  // Get the interspersed timeline
  const timeline = createInterspersedTimeline();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Wave Background */}
      <div className="absolute w-full h-full opacity-10 pointer-events-none z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full">
          <path fill="#0ea5e9" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Mobile Toggle Button - only visible on mobile */}
      <button 
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 ${sidebarVisible ? 'left-[18rem]' : 'left-4'} z-50 bg-sky-700 text-white p-2 rounded-full shadow-lg transition-all duration-300`}
        aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
      >
        {sidebarVisible ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>

      {/* Scroll to Bottom Button - always visible with tooltip */}
      <div className="fixed bottom-24 right-6 z-20 group">
        <button 
          onClick={scrollToBottom}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
          aria-label="Scroll to latest messages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7" />
          </svg>
        </button>
        <span className={`absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs whitespace-nowrap rounded pointer-events-none transition-opacity duration-200 ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
          View latest messages
        </span>
      </div>

      {/* Sidebar - with mobile responsive behavior */}
      <div 
        className={`${sidebarVisible ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-72 md:w-80 bg-slate-900 bg-opacity-70 backdrop-blur-sm p-6 flex flex-col z-10 shadow-xl overflow-y-auto fixed md:sticky top-0 h-screen transition-transform duration-300`}
      >
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link 
            to="/home" 
            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <h2 className="text-2xl font-semibold text-white mb-6">Plan your perfect trip</h2>
        
        {/* Filters */}
        <div className="mb-8">
          <h3 className="text-sky-400 mb-3 font-medium">Filter by:</h3>
          
          <div className="space-y-3">
            {renderFilterSelect('duration', filterOptions.duration)}
            {renderFilterSelect('budget', filterOptions.budget)}
            {renderFilterSelect('group', filterOptions.group)}
          </div>
        </div>
        
        {/* Interests */}
        <InterestSelector 
          interests={interests}
          onAddInterest={addInterest}
          onRemoveInterest={removeInterest}
          onClearAll={clearAllInterests}
        />

        {/* Quick Access to Events */}
        <div className="mt-6">
          <h3 className="text-sky-400 mb-3 font-medium">Upcoming Events</h3>
          <div className="space-y-2">
            {eventsData.slice(0, 3).map(event => (
              <div key={event.id} className="bg-slate-800 bg-opacity-40 rounded-lg p-3 hover:bg-slate-700 transition-colors cursor-pointer">
                <h4 className="font-medium text-white">{event.name}</h4>
                <p className="text-sm text-sky-200">{event.date} • {event.location}</p>
              </div>
            ))}
            <Link to="/" className="text-sm text-sky-200 hover:text-white flex items-center">
              View all events
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Spacer before powered by section */}
        <div className="py-6"></div>
      </div>
      
      {/* Main Chat Area - adjusted for mobile sidebar */}
      <div className={`flex-1 flex flex-col p-6 overflow-hidden z-10 bg-slate-800 bg-opacity-30 backdrop-blur-sm transition-all duration-300 ${sidebarVisible ? 'md:ml-0 ml-72' : 'ml-0'}`}>
        {/* Powered by Gemini - positioned at top right */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-2 bg-sky-800 text-white rounded-full py-2 px-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"></path>
              <path d="M12 22v-3.5"></path>
              <path d="M12 2v3.5"></path>
              <path d="M4.22 19.78l2.12-2.12"></path>
              <path d="m19.78 4.22-2.12 2.12"></path>
              <path d="M2 12h3.5"></path>
              <path d="M22 12h-3.5"></path>
              <path d="M4.22 4.22l2.12 2.12"></path>
              <path d="m19.78 19.78-2.12-2.12"></path>
            </svg>
            <span>Powered by Gemini 1.5</span>
          </div>
        </div>
        
        {/* Messages container with ref for the scroll function */}
        <div 
          ref={messagesContainerRef}
          className="relative flex-1 overflow-y-auto mb-4 space-y-6 flex flex-col items-center"
        >
          <div className="w-full max-w-3xl">
            {/* Render messages and timeline components interspersed */}
            {timeline.map(item => (
              <div key={item.id} className="mb-6">
                {item.isTimelineComponent ? (
                  renderTimelineComponent(item)
                ) : (
                  <ChatMessage 
                    message={item} 
                    aiLogo={AiLOGO} 
                  />
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-6">
                <LoadingIndicator 
                  type="chat" 
                  aiLogo={AiLOGO} 
                />
              </div>
            )}
          </div>
          
          {/* Invisible element for manual scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Spacer instead of wave divider */}
        <div className="h-4 mb-4"></div>
        
        {/* Message Input */}
        <div className="flex justify-center w-full">
          <div className="w-full max-w-3xl">
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
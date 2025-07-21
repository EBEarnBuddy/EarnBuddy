import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  Users,
  MessageCircle,
  Settings,
  MoreVertical,
  Maximize,
  Minimize,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
}

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  participants: Participant[];
}

export const VideoCall: React.FC<VideoCallProps> = ({
  isOpen,
  onClose,
  roomName,
  participants
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chatMessages = [
    { id: '1', user: 'Sarah Chen', message: 'Great presentation!', timestamp: '2:30 PM' },
    { id: '2', user: 'Marcus Rodriguez', message: 'Can you share the slides?', timestamp: '2:31 PM' },
    { id: '3', user: 'Alex Kim', message: 'The audio is crystal clear', timestamp: '2:32 PM' }
  ];

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Initialize video stream (mock)
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setIsScreenSharing(true);
      // Handle screen sharing logic
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      // Handle sending chat message
      setChatMessage('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="font-semibold">{roomName}</h2>
                <p className="text-sm text-gray-300">{participants.length} participants</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video Grid */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                {/* Main Video */}
                <div className="md:col-span-2 lg:col-span-2 relative bg-gray-800 rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-white text-sm font-medium">You</span>
                  </div>
                  {!isVideoOn && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Camera is off</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participant Videos */}
                {participants.slice(0, 4).map((participant, index) => (
                  <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden">
                    {participant.isVideoOn ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-16 h-16 rounded-full mx-auto mb-2"
                          />
                          <p className="text-white text-sm">{participant.name}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                        <span className="text-white text-xs">{participant.name}</span>
                      </div>
                      {!participant.isAudioOn && (
                        <div className="bg-red-500 p-1 rounded">
                          <MicOff className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Sidebar */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
                  initial={{ x: 320 }}
                  animate={{ x: 0 }}
                  exit={{ x: 320 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Chat</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-400 font-medium">{msg.user}</span>
                          <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-300">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-4 rounded-full transition-colors ${
                isAudioOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={startScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Monitor className="w-6 h-6" />
            </button>

            <button
              onClick={onClose}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
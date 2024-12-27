import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// SVG Robot components
const BaseRobot = ({ name, isProcessing, type = 'default' }) => {
  console.log('rerendering base robot ', name, isProcessing);
  const [dots, setDots] = useState('...');

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '.' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100">
      {isProcessing && (
        <text x="50" y="15" className="text-sm" textAnchor="middle" fill="currentColor">
          {dots}
        </text>
      )}
      
      <rect 
        x="25" 
        y="20" 
        width="50" 
        height="40" 
        rx="5" 
        className="fill-current"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      />
      
      {type === 'FXN' ? (
        <>
          <text x="35" y="45" fontSize="12" fill="white">⚡</text>
          <text x="55" y="45" fontSize="12" fill="white">⚡</text>
        </>
      ) : type === 'grader' ? (
        <>
          <text x="35" y="45" fontSize="12" fill="white">✓</text>
          <text x="55" y="45" fontSize="12" fill="white">✓</text>
        </>
      ) : (
        <>
          <circle cx="40" cy="40" r="5" fill="white"/>
          <circle cx="60" cy="40" r="5" fill="white"/>
        </>
      )}
      
      <path 
        d="M40,50 Q50,60 60,50" 
        stroke="white" 
        fill="none" 
        strokeWidth="2"
      />
      
      <rect 
        x="10" 
        y="65" 
        width="80" 
        height="18" 
        rx="2" 
        className="fill-current opacity-80"
      />
      <text 
        x="50" 
        y="78" 
        fontSize="10" 
        fill="white" 
        textAnchor="middle"
      >
        {name}
      </text>
    </svg>
  );
};

const MessageFeed = ({ messages }) => {
  console.log('MessageFeed render:', { messages });
  return (
  <div className="h-64 w-full rounded-lg p-4 bg-[#18191a] border border-[#2a2b3e] overflow-auto">
    <div className="space-y-2">
      {messages.map((msg, idx) => (
        <div key={idx} className="text-sm">
          <span className="font-semibold text-purple-300">{msg.agent}: </span>
          <span className="text-gray-300">{msg.message}</span>
        </div>
      ))}
    </div>
  </div>
);
}

const AgentVisualization = () => {
  const [agents, setAgents] = useState([
    { id: 1, name: 'user_proxy', type: 'default', isProcessing: false },
    { id: 2, name: 'reason_agent', type: 'default', isProcessing: false },
    { id: 3, name: 'tot_grader', type: 'grader', isProcessing: false },
    { id: 4, name: 'FXN', type: 'FXN', isProcessing: false }
  ]);
  
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    console.log('Connected to socket');
    
    ws.onmessage = (event) => {
      console.log('Socket message ', event);
      try {
        const data = JSON.parse(event.data);
        
        const currentData = data?.current || {};
        const agentName = currentData?.agent;
        const status = currentData?.status || {};

        console.log('status is', status);
        console.log('data is', currentData);
        console.log('name is', agentName);
        
        if (agentName) {
          setAgents(prev => prev.map(agent => 
            agent.name === agentName
              ? {...agent, isProcessing: Boolean(status.isProcessing)}
              : agent
          ));
        }
        
        if (status.message) {
          setMessages(prev => [...prev, {
            agent: agentName,
            message: status.message
          }].slice(-10)); // Keep last 10 messages
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const localAgents = agents.filter(agent => agent.name !== 'FXN');
  const fxnAgent = agents.find(agent => agent.name === 'FXN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b2e] to-[#000000]">
      <div className="w-full p-8">
      <div className="flex flex-row">
      <img src="https://fxn.world/fxn_logo.svg" className="h-8"/>
        <h2 className="text-2xl font-bold mb-8 text-white/90 text-left ml-[250px]">
          Multi-Agent System with Agent Augmented Generation (AAG)
        </h2>
        </div>
        
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex-grow border-2 border-purple-500/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              {localAgents.map(agent => (
                <div 
                  key={agent.id} 
                  className={`p-4 flex flex-col items-center bg-[#1a1b2e]/50 border border-[#2a2b3e] rounded-lg backdrop-blur-sm ${
                    agent.isProcessing ? 'ring-2 ring-purple-500/50' : ''
                  }`}
                >
                  <BaseRobot
                    name={agent.name}
                    isProcessing={agent.isProcessing}
                    type={agent.type}
                    className="text-purple-400"
                  />
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-white/90">{agent.name}</h3>
                    <p className={`text-sm ${
                      agent.isProcessing 
                        ? 'text-purple-400' 
                        : 'text-gray-400'
                    }`}>
                      {agent.isProcessing ? 'Processing...' : 'Idle'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            className={`w-16 border-t-2 border-dashed ${
              fxnAgent?.isProcessing ? 'border-purple-500' : 'border-gray-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: '4rem' }}
            transition={{ duration: 0.5 }}
          />

          {fxnAgent && (
            <div className="p-4 flex flex-col items-center bg-[#1a1b2e]/50 border border-[#2a2b3e] rounded-lg backdrop-blur-sm">
              <BaseRobot
                name={fxnAgent.name}
                isProcessing={fxnAgent.isProcessing}
                type={fxnAgent.type}
                className="text-purple-400"
              />
              <div className="mt-4 text-center">
                <h3 className="font-semibold text-white/90">{fxnAgent.name}</h3>
                <p className={`text-sm ${
                  fxnAgent.isProcessing 
                    ? 'text-purple-400' 
                    : 'text-gray-400'
                }`}>
                  {fxnAgent.isProcessing ? 'Processing...' : 'Idle'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white/90">
            Agent Communication Feed
          </h3>
          <MessageFeed messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default AgentVisualization;


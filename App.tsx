import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Device, SecurityAlert, ThreatLevel, ThreatProfile, ChatMessage, AccessibilityConfig, SafetyInterlock, TrainingMetric } from './types';
import { analyzeThreat, generateChatResponse } from './services/geminiService';
import { StorageService, Analyst } from './services/storageService';

// --- CONSTANTS ---
const TRANSLATIONS = {
  en: {
    title: "Sudarshan Chakra",
    subtitle: "Neural IoT Defense Matrix",
    discovery: "Node Discovery",
    incidentControl: "Incident Control Center",
    architecture: "System Architecture",
    theftSim: "Simulate Physical Theft",
    fireSim: "Simulate Fire Hazard",
    hiddenSim: "Simulate Camera Hidden",
    brokenSim: "Simulate Camera Broken",
    breachSim: "Trigger RED ALERT (Hacker Breach)",
    honeypotSim: "Deploy Deception Cube",
    forensics: "Neural Forensic Visuals",
    inferences: "Sudarshan Core Inferences",
    chatTitle: "Sudarshan Security Chat",
    chatPlaceholder: "Ask security consultant...",
    chatWelcome: "Analyst, Sudarshan Core is online. How may I assist with IoT security today?",
    egressMonitor: "Neural Egress Monitor",
    syncing: "Autonomous Forensic Sync...",
    dataStream: "Packet Exfiltration Log",
    sceneIntegrity: "Scene Integrity Index",
    decoyLog: "Decoy Trap Activity",
    autonomousMode: "Autonomous Monitoring: ACTIVE",
    accessibility: "Accessibility",
    accessibilitySettings: "Accessibility Settings",
    highContrast: "High Contrast Mode",
    largeTargets: "Large Interactive Targets",
    simplifiedReadout: "Simplified Interface",
    voiceAssist: "Voice Assistance",
    close: "Close",
    safetyStudio: "Neural Safety Studio",
    datasetManager: "Dataset Hierarchy",
    trainModel: "Train Custom YOLO",
    trainingMetrics: "Training Telemetry",
    interlocks: "Response Interlocks",
    activeModel: "Active Model: yolov8n.pt",
    trainingComplete: "Retraining Complete: best.pt saved.",
    interlockLabel: "If {0} then {1}",
    cameraEnhanced: "Enhanced Vision Core",
    nightVision: "Night Vision",
    thermal: "Thermal Mode",
    aiOverlay: "AI Detection",
    snapshot: "Capture",
    record: "Record Neural Stream",
    ptzUp: "Tilt Up",
    ptzDown: "Tilt Down",
    ptzLeft: "Pan Left",
    ptzRight: "Pan Right",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    visionGrid: "Neural Multi-Vision Grid",
    allCameraActive: "All Cameras: ACTIVE",
    wallMode: "Security Wall Mode",
    deployHoneypot: "Deploy Deception Cube",
    honeypotActive: "Honeypot Core Active",
    trapTriggered: "DECEPTION TRIGGERED: Attacker interaction detected.",
    voiceControlActive: "Sentinel Listening...",
    voiceControlDisabled: "Voice Control: Offline"
  },
  hi: {
    title: "सुदर्शन चक्र",
    subtitle: "तंत्रिका आईओटी रक्षा मैट्रिक्स",
    discovery: "नोड खोज",
    incidentControl: "घटना नियंत्रण केंद्र",
    architecture: "सिस्टम आर्किटेक्चर",
    theftSim: "चोरी का अनुकरण करें",
    fireSim: "अग्नि खतरे का अनुकरण करें",
    hiddenSim: "कैमरा छिपा हुआ अनुकरण करें",
    brokenSim: "कैमरा टूटा हुआ अनुकरण करें",
    breachSim: "हैकर रेड अलर्ट ट्रिगर करें",
    honeypotSim: "डिसेप्शन क्यूब तैनात करें",
    forensics: "फोरेंसिक दृश्य",
    inferences: "सुदर्शन कोर निष्कर्ष",
    chatTitle: "सुदर्शन सुरक्षा चैट",
    chatPlaceholder: "सुरक्षा सलाहकार से पूछें...",
    chatWelcome: "विश्लेषक, सुदर्शन कोर ऑनलाइन है। मैं आज कैसे सहायता कर सकता हूँ?",
    egressMonitor: "न्यूरल इग्रेस मॉनिटर",
    syncing: "स्वचालित बैकएंड सिंक...",
    dataStream: "पैकेट एक्सफिल्ट्रेशन लॉग",
    sceneIntegrity: "दृश्य अखंडता सूचकांक",
    decoyLog: "डिकॉय ट्रैप गतिविधि",
    autonomousMode: "स्वायत्त निगरानी: सक्रिय",
    accessibility: "अभिगम्यता",
    accessibilitySettings: "अभिगम्यता सेटिंग्स",
    highContrast: "उच्च कंट्रास्ट मोड",
    largeTargets: "बड़े लक्ष्य",
    simplifiedReadout: "सरलीकृत इंटरफ़ेस",
    voiceAssist: "आवाज सहायता",
    close: "बंद करें",
    safetyStudio: "न्यूरल सेफ्टी स्टूडियो",
    datasetManager: "डेटासेट पदानुक्रम",
    trainModel: "प्रशिक्षण शुरू करें",
    trainingMetrics: "प्रशिक्षण टेलीमेट्री",
    interlocks: "रिस्पॉन्स इंटरलॉक्स",
    activeModel: "सक्रिय मॉडल: yolov8n.pt",
    trainingComplete: "पुनर्प्रशिक्षण पूर्ण।",
    interlockLabel: "यदि {0} तो {1}",
    cameraEnhanced: "उन्नत दृष्टि कोर",
    nightVision: "रात्रि दृष्टि",
    thermal: "थर्मल मोड",
    aiOverlay: "AI पहचान",
    snapshot: "कैप्चर",
    record: "रिकॉर्ड करें",
    ptzUp: "ऊपर",
    ptzDown: "नीचे",
    ptzLeft: "बाएँ",
    ptzRight: "दाएँ",
    zoomIn: "ज़ूम इन",
    zoomOut: "ज़ूम आउट",
    visionGrid: "न्यूरल मल्टी-विज़न ग्रिड",
    allCameraActive: "सभी कैमरे: सक्रिय",
    wallMode: "सुरक्षा दीवार मोड",
    deployHoneypot: "डिसेप्शन क्यूब तैनात करें",
    honeypotActive: "हनीपॉट कोर सक्रिय",
    trapTriggered: "धोखाधड़ी शुरू: हमलावर की गतिविधि का पता चला।",
    voiceControlActive: "सेंटिनल सुन रहा है...",
    voiceControlDisabled: "वॉयस कंट्रोल: ऑफलाइन"
  }
};

const PREDEFINED_PROFILES: ThreatProfile[] = [
  { id: 'p1', name: 'Standard Endpoint', criticality: ThreatLevel.LOW, description: 'General IoT devices.', expectedBehavior: 'Low bandwidth.' },
  { id: 'p2', name: 'High-Security Link', criticality: ThreatLevel.HIGH, description: 'Critical entry points.', expectedBehavior: 'Constant stream.' },
  { id: 'p3', name: 'Core Infrastructure', criticality: ThreatLevel.CRITICAL, description: 'Vital network infra.', expectedBehavior: '24/7 uptime.' },
];

const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'Alpha Cam - Gate', ip: '192.168.1.50', mac: '00:0c:29:ab:cd:ef', type: 'camera', status: 'online', lastSeen: 'Now', profile: PREDEFINED_PROFILES[1], hardwareHealth: 100, sceneIntegrity: 98 },
  { id: '5', name: 'Beta Cam - Hallway', ip: '192.168.1.51', mac: '00:0c:29:ab:cc:11', type: 'camera', status: 'online', lastSeen: 'Now', profile: PREDEFINED_PROFILES[1], hardwareHealth: 99, sceneIntegrity: 100 },
  { id: '6', name: 'Gamma Cam - Perimeter', ip: '192.168.1.52', mac: '00:0c:29:ab:cc:22', type: 'camera', status: 'online', lastSeen: 'Now', profile: PREDEFINED_PROFILES[2], hardwareHealth: 100, sceneIntegrity: 95 },
  { id: '7', name: 'Delta Cam - Lobby', ip: '192.168.1.53', mac: '00:0c:29:ab:cc:33', type: 'camera', status: 'online', lastSeen: 'Now', profile: PREDEFINED_PROFILES[1], hardwareHealth: 98, sceneIntegrity: 99 },
  { id: '2', name: 'Main Control Hub', ip: '192.168.1.1', mac: '00:0c:29:12:34:56', type: 'hub', status: 'online', lastSeen: 'Now', profile: PREDEFINED_PROFILES[2], hardwareHealth: 98, sceneIntegrity: 100 },
  { id: '3', name: 'Front Door Lock', ip: '192.168.1.10', mac: '00:0c:29:12:34:AA', type: 'lock', status: 'online', lastSeen: 'Now' },
  { id: '4', name: 'Kitchen Gas Valve', ip: '192.168.1.11', mac: '00:0c:29:12:34:BB', type: 'gas-valve', status: 'online', lastSeen: 'Now' }
];

const INITIAL_INTERLOCKS: SafetyInterlock[] = [
  { id: 'int1', trigger: 'FIRE_DETECTION', action: 'OPEN_GAS_VENTS', isActive: true, deviceType: 'gas-valve' },
  { id: 'int2', trigger: 'THEFT_ALERT', action: 'LOCK_ALL_EXITS', isActive: true, deviceType: 'lock' },
  { id: 'int3', trigger: 'SUDDEN_SILENCE', action: 'SNAPSHOT_BACKUP', isActive: false, deviceType: 'camera' }
];

// --- COMPONENTS ---

const LiveFeedSimulation = ({ 
  isStolen, 
  isHidden, 
  isBroken, 
  neuralEnhance, 
  fireHeatmapActive, 
  isBreached, 
  nightVision, 
  thermal, 
  aiOverlay,
  zoom,
  pan,
  tilt,
  simplified = false,
  smallMode = false,
  deviceName = ""
}: { 
  isStolen: boolean, 
  isHidden: boolean, 
  isBroken: boolean, 
  neuralEnhance: boolean, 
  fireHeatmapActive: boolean, 
  isBreached: boolean,
  nightVision: boolean,
  thermal: boolean,
  aiOverlay: boolean,
  zoom: number,
  pan: number,
  tilt: number,
  simplified?: boolean,
  smallMode?: boolean,
  deviceName?: string
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [metrics, setMetrics] = useState({ fps: 0, bitrate: 0, jitter: 0 });

  useEffect(() => {
    if (!isStolen && !isHidden && !isBroken) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 60 } })
        .then(s => { setStream(s); setHasCamera(true); })
        .catch(() => setHasCamera(false));
    } else {
      setHasCamera(false);
      stream?.getTracks().forEach(t => t.stop());
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [isStolen, isHidden, isBroken]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics({
        fps: Math.floor(58 + Math.random() * 4),
        bitrate: Math.floor(4500 + Math.random() * 500),
        jitter: Math.floor(2 + Math.random() * 3)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filterClass = nightVision 
    ? 'sepia brightness-150 saturate-200 hue-rotate-[90deg] contrast-150' 
    : thermal 
      ? 'invert hue-rotate-180 brightness-150 saturate-200 contrast-200'
      : neuralEnhance ? 'brightness-110 contrast-125 saturate-110' : '';

  return (
    <div className={`w-full h-full relative overflow-hidden bg-black ${smallMode ? 'rounded-2xl' : 'rounded-[3rem]'} border border-white/10 flex items-center justify-center ${isBreached ? 'animate-[pulse_0.5s_infinite_alternate] border-red-500/50' : ''}`}>
      {(isStolen || isHidden || isBroken) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden">
          <div className="noise-overlay absolute inset-0 opacity-40"></div>
          <div className="z-20 text-center animate-pulse">
            <i className={`fas ${isStolen ? 'fa-video-slash' : isHidden ? 'fa-eye-slash' : 'fa-bolt-lightning'} ${smallMode ? 'text-3xl' : 'text-7xl'} text-red-600/80 mb-4`}></i>
            <h4 className={`${smallMode ? 'text-[10px]' : 'text-3xl'} font-black text-red-500 italic uppercase tracking-[0.2em]`}>OFFLINE</h4>
          </div>
        </div>
      ) : (
        <>
          <div 
            className={`w-full h-full transition-all duration-500 ${filterClass}`}
            style={{ 
              transform: `scale(${zoom}) translateX(${pan}%) translateY(${tilt}%)`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {hasCamera ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
                <div className="absolute inset-0 bg-cover bg-center grayscale opacity-20" style={{backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200')"}}></div>
            )}
          </div>

          {/* AI Detection Boxes Overlay */}
          {aiOverlay && !isBreached && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className={`absolute top-[20%] left-[30%] ${smallMode ? 'w-[40px] h-[40px]' : 'w-[150px] h-[150px]'} border-2 border-cyan-500/80 flex flex-col justify-start items-start p-1`}>
                 <span className="bg-cyan-500 text-black text-[6px] font-black px-1">PERSON: 98%</span>
              </div>
            </div>
          )}

          {/* HUD Overlay */}
          <div className={`absolute inset-0 pointer-events-none z-30 ${smallMode ? 'p-3' : 'p-8'} flex flex-col justify-between font-mono text-[8px] text-cyan-500/80`}>
            <div className="flex justify-between items-start">
               <div className="bg-black/60 backdrop-blur px-2 py-0.5 border border-white/10 rounded-md flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-[7px]">{deviceName || 'NODE_VISION'}</span>
               </div>
               {!smallMode && <div className="text-right bg-black/40 px-3 py-1 rounded-lg">FPS: {metrics.fps}</div>}
            </div>
            
            {!smallMode && (
              <div className="flex justify-between items-end">
                <div className="bg-black/40 px-3 py-1 rounded-lg">TIMESTAMP: {new Date().toLocaleTimeString()}</div>
                <div className="w-12 h-12 border-r border-b border-cyan-500/30"></div>
              </div>
            )}
          </div>

          {/* Corner Decor */}
          <div className={`absolute top-0 left-0 ${smallMode ? 'w-2 h-2 m-2' : 'w-8 h-8 m-6'} border-t border-l border-cyan-500/60`}></div>
          <div className={`absolute bottom-0 right-0 ${smallMode ? 'w-2 h-2 m-2' : 'w-8 h-8 m-6'} border-b border-r border-cyan-500/60`}></div>
        </>
      )}
    </div>
  );
};

const DatasetTree = ({ lang }: { lang: 'en' | 'hi' }) => (
  <div className="font-mono text-[10px] space-y-1 text-cyan-400/70 p-4 bg-black/40 rounded-xl border border-white/5">
    <div>fire_dataset/</div>
    <div className="pl-4">├── data.yaml</div>
    <div className="pl-4">├── train/</div>
    <div className="pl-8">├── images/ <span className="text-white/30">(80% samples)</span></div>
    <div className="pl-8">└── labels/ <span className="text-white/30">(YOLO .txt)</span></div>
    <div className="pl-4">└── val/</div>
    <div className="pl-8">├── images/ <span className="text-white/30">(20% samples)</span></div>
    <div className="pl-8">└── labels/</div>
  </div>
);

const App: React.FC = () => {
  const [analyst, setAnalyst] = useState<Analyst | null>(StorageService.getActiveSession());
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [redAlertActive, setRedAlertActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [appLang, setAppLang] = useState<'en' | 'hi'>('en');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibility, setAccessibility] = useState<AccessibilityConfig>({
    highContrast: false,
    voiceAssist: false,
    largeTargets: false,
    simplifiedReadout: false,
    language: 'en',
    speechEnabled: true
  });
  const [showSafetyStudio, setShowSafetyStudio] = useState(false);
  const [fireHeatmapActive, setFireHeatmapActive] = useState(false);
  const [interlocks, setInterlocks] = useState<SafetyInterlock[]>(INITIAL_INTERLOCKS);
  
  // Camera State
  const [nightVision, setNightVision] = useState(false);
  const [thermalMode, setThermalMode] = useState(false);
  const [aiOverlay, setAiOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Training State
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState<TrainingMetric[]>([]);

  const t = TRANSLATIONS[appLang];

  const speakNarrative = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !accessibility.speechEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = appLang === 'en' ? 'en-US' : 'hi-IN';
    window.speechSynthesis.speak(utterance);
  }, [appLang, accessibility.speechEnabled]);

  const handleManualAnomaly = (type: 'HIDDEN' | 'BROKEN' | 'FIRE' | 'THEFT') => {
    if (!selectedDevice) return;
    const updated = { ...selectedDevice, tamperAlerted: false };
    if (type === 'HIDDEN') { updated.sceneIntegrity = 0; updated.status = 'compromised' as const; }
    if (type === 'BROKEN') { updated.hardwareHealth = 0; updated.status = 'offline' as const; }
    if (type === 'FIRE') { 
        updated.status = 'compromised' as const; 
        setFireHeatmapActive(true);
        const lock = interlocks.find(i => i.trigger === 'FIRE_DETECTION');
        if (lock?.isActive) {
            setSyncLogs(prev => [...prev, `INTERLOCK: Executing ${lock.action} on ${lock.deviceType}...`]);
            speakNarrative(appLang === 'en' ? "Fire detected. Interlocks engaged." : "आग का पता चला। इंटरलॉक्स सक्रिय।");
        }
    }
    if (type === 'THEFT') { 
        updated.status = 'offline' as const; updated.hardwareHealth = 0; updated.sceneIntegrity = 0; 
        const lock = interlocks.find(i => i.trigger === 'THEFT_ALERT');
        if (lock?.isActive) {
            setSyncLogs(prev => [...prev, `INTERLOCK: Locking all ${lock.deviceType}s.`]);
            speakNarrative(appLang === 'en' ? "Security breach. Locking all exits." : "सुरक्षा उल्लंघन। सभी निकास द्वार बंद।");
        }
    }
    setDevices(prev => prev.map(d => d.id === selectedDevice.id ? updated : d));
    setSelectedDevice(updated);
  };

  const resetPTZ = useCallback(() => { setZoom(1); setPan(0); setTilt(0); }, []);

  // VOICE COMMAND RECOGNITION LOGIC
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = appLang === 'en' ? 'en-US' : 'hi-IN';

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('VOICE COMMAND:', command);

      if (command.includes('pan left') || command.includes('बाएं')) {
        setPan(p => p - 10);
        speakNarrative(appLang === 'en' ? 'Panning left' : 'बाएं घूम रहा है');
      } else if (command.includes('pan right') || command.includes('दाएं')) {
        setPan(p => p + 10);
        speakNarrative(appLang === 'en' ? 'Panning right' : 'दाएं घूम रहा है');
      } else if (command.includes('tilt up') || command.includes('ऊपर')) {
        setTilt(p => p - 10);
        speakNarrative(appLang === 'en' ? 'Tilting up' : 'ऊपर झुक रहा है');
      } else if (command.includes('tilt down') || command.includes('नीचे')) {
        setTilt(p => p + 10);
        speakNarrative(appLang === 'en' ? 'Tilting down' : 'नीचे झुक रहा है');
      } else if (command.includes('zoom in') || command.includes('बड़ा करें')) {
        setZoom(p => Math.min(p + 0.3, 3));
        speakNarrative(appLang === 'en' ? 'Zooming in' : 'ज़ूम इन');
      } else if (command.includes('zoom out') || command.includes('छोटा करें')) {
        setZoom(p => Math.max(p - 0.3, 1));
        speakNarrative(appLang === 'en' ? 'Zooming out' : 'ज़ूम आउट');
      } else if (command.includes('reset') || command.includes('रीसेट')) {
        resetPTZ();
        speakNarrative(appLang === 'en' ? 'Resetting vision' : 'दृष्टि रीसेट');
      }
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening, appLang, resetPTZ, speakNarrative]);

  const deployHoneypot = () => {
    const honeypot: Device = {
        id: `trap-${Date.now()}`,
        name: 'Deception Cube',
        ip: `192.168.1.${Math.floor(Math.random() * 254) + 2}`,
        mac: 'FF:FF:FF:DE:AD:BE',
        type: 'hub',
        status: 'online',
        lastSeen: 'Now',
        isHoneypot: true,
        profile: PREDEFINED_PROFILES[2], // CRITICAL
        hardwareHealth: 100,
        trapLogs: [`DEPLOYED: ${new Date().toISOString()}`]
    };
    setDevices(prev => [...prev, honeypot]);
    setSyncLogs(prev => [...prev, `DEPLOYED: Honeypot 'Deception Cube' initialized at Discovery Layer.`]);
    speakNarrative(appLang === 'en' ? "Deception Cube deployed. Threat monitoring active." : "डिसेप्शन क्यूब तैनात। खतरा निगरानी सक्रिय।");
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);
    const response = await generateChatResponse(chatInput, chatHistory, appLang, devices);
    setChatHistory(prev => [...prev, { role: 'model', text: response, timestamp: new Date().toLocaleTimeString() }]);
    setIsTyping(false);
  };

  const cameraDevices = useMemo(() => devices.filter(d => d.type === 'camera'), [devices]);

  if (!analyst) {
    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#020408]">
            <div className="glass-panel w-full max-w-md rounded-[3rem] p-12 text-center border border-white/5">
                <h1 className="text-4xl font-black uppercase italic title-gradient">Sudarshan Chakra</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.4em] mt-2">NEURAL DEFENSE CORE</p>
                <button onClick={() => setAnalyst(StorageService.saveAnalyst("Admin", "Safety-Hub"))} className="w-full bg-cyan-600 mt-12 py-6 rounded-2xl font-black uppercase text-xs hover:bg-cyan-500 transition-all shadow-[0_20px_40px_-10px_rgba(0,242,255,0.3)]">Establish Neural Link</button>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 lg:p-12 ${accessibility.highContrast ? 'bg-black' : 'bg-[#020408]'} text-white overflow-x-hidden ${redAlertActive ? 'red-alert-bg' : ''}`}>
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10">
        <div className="flex flex-col">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter title-gradient">{t.title}</h1>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.4em] uppercase mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-4">
            <div className="px-6 py-3 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase flex items-center gap-3">
                <i className="fas fa-video animate-pulse"></i> {t.allCameraActive}
            </div>
            <button onClick={() => setShowSafetyStudio(true)} className="px-6 py-3 rounded-xl bg-orange-600/10 border border-orange-600/30 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600/20 transition-all">
                <i className="fas fa-brain mr-2"></i> {t.safetyStudio}
            </button>
            <button onClick={() => setShowAccessibility(true)} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <i className="fas fa-universal-access"></i> {t.accessibility}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12 max-w-screen-2xl mx-auto pb-24">
        {/* Sidebar: Discovery Layer */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-panel rounded-[3rem] p-8 border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-4">
                        <i className="fas fa-microchip text-cyan-500"></i> {t.discovery}
                    </h2>
                    <button onClick={deployHoneypot} className="px-4 py-2 bg-purple-600/20 border border-purple-500/40 text-purple-400 rounded-xl text-[8px] font-black uppercase hover:bg-purple-600/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <i className="fas fa-ghost mr-2"></i> {t.deployHoneypot}
                    </button>
                </div>
                <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                    {devices.map(d => (
                        <button 
                            key={d.id} 
                            onClick={() => setSelectedDevice(d)} 
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                selectedDevice?.id === d.id 
                                    ? d.isHoneypot ? 'bg-purple-500/10 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_20px_rgba(0,242,255,0.2)]' 
                                    : d.isHoneypot ? 'bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40' : 'bg-slate-900/40 border-transparent hover:border-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                                    d.isHoneypot ? 'bg-purple-600/20 text-purple-400' : d.status === 'online' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-600/20 text-red-500'
                                }`}>
                                    <i className={`fas ${d.isHoneypot ? 'fa-ghost' : d.type === 'camera' ? 'fa-video' : d.type === 'lock' ? 'fa-lock' : d.type === 'gas-valve' ? 'fa-fire-extinguisher' : 'fa-server'}`}></i>
                                </div>
                                <div>
                                    <p className={`font-bold uppercase text-[10px] ${d.isHoneypot ? 'text-purple-300' : 'text-white'}`}>{d.name}</p>
                                    <p className="text-[8px] font-mono text-gray-500">{d.status} {d.isHoneypot && '// TRAP_ENABLED'}</p>
                                </div>
                            </div>
                            {d.isHoneypot && (
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel rounded-[3rem] p-8 border border-white/5 shadow-2xl">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-4">
                    <i className="fas fa-link text-orange-500"></i> {t.interlocks}
                </h2>
                <div className="space-y-3">
                    {interlocks.map(lock => (
                        <div key={lock.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">{lock.trigger}</p>
                                <p className="text-[10px] font-black text-white italic">{lock.action}</p>
                            </div>
                            <button 
                                onClick={() => setInterlocks(prev => prev.map(i => i.id === lock.id ? { ...i, isActive: !i.isActive } : i))}
                                className={`w-10 h-5 rounded-full transition-all relative ${lock.isActive ? 'bg-orange-500' : 'bg-slate-800'}`}
                            >
                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${lock.isActive ? 'left-6' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Monitoring View */}
        <div className="col-span-12 lg:col-span-8">
            <div className={`glass-panel rounded-[4rem] p-10 border border-white/5 min-h-[700px] shadow-2xl relative overflow-hidden transition-all duration-700 ${selectedDevice?.isHoneypot ? 'border-purple-500/40 bg-purple-950/5' : ''}`}>
                <div className="flex justify-between items-center mb-10">
                    <h2 className={`text-4xl font-black uppercase italic ${selectedDevice?.isHoneypot ? 'text-purple-500' : 'title-gradient'}`}>
                        {selectedDevice ? selectedDevice.name : t.visionGrid}
                    </h2>
                    <div className="flex gap-4 items-center">
                        {selectedDevice && (
                            <button 
                                onClick={() => {
                                    setIsListening(!isListening);
                                    speakNarrative(!isListening ? t.voiceControlActive : t.voiceControlDisabled);
                                }} 
                                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-2 ${isListening ? 'bg-red-600/20 text-red-500 border border-red-500/40 animate-pulse' : 'bg-white/10 text-gray-400 border border-white/10'}`}
                            >
                                <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                                {isListening ? 'SENTINEL_ACTIVE' : 'VOICE_COMMANDS'}
                            </button>
                        )}
                        {!selectedDevice && (
                            <div className="px-6 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase text-cyan-500">
                            {t.wallMode}: {cameraDevices.length} ACTIVE
                            </div>
                        )}
                    </div>
                </div>

                {!selectedDevice ? (
                    <div className="grid grid-cols-2 gap-6 h-full min-h-[500px] animate-in fade-in duration-700">
                        {cameraDevices.map(cam => (
                            <div key={cam.id} onClick={() => setSelectedDevice(cam)} className="group cursor-pointer relative aspect-video transition-all hover:scale-[1.02]">
                                <LiveFeedSimulation 
                                    isStolen={cam.status === 'offline' && cam.hardwareHealth === 0}
                                    isHidden={cam.sceneIntegrity === 0}
                                    isBroken={cam.hardwareHealth === 0}
                                    neuralEnhance={true}
                                    fireHeatmapActive={fireHeatmapActive}
                                    isBreached={redAlertActive}
                                    nightVision={false}
                                    thermal={false}
                                    aiOverlay={true}
                                    zoom={1} pan={0} tilt={0}
                                    smallMode={true}
                                    deviceName={cam.name}
                                />
                                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-all pointer-events-none rounded-2xl border border-transparent group-hover:border-cyan-500/30"></div>
                            </div>
                        ))}
                        {cameraDevices.length < 4 && (
                            <div className="aspect-video bg-white/5 border border-white/5 border-dashed rounded-2xl flex items-center justify-center text-gray-700 text-[10px] font-black uppercase italic">
                                + Add Neural Node
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom duration-500">
                        <div className={`relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border ${selectedDevice.isHoneypot ? 'border-purple-500/30' : 'border-white/10'} bg-black`}>
                            {flash && <div className="absolute inset-0 bg-white z-[60] animate-pulse"></div>}
                            {selectedDevice.type === 'camera' ? (
                                <LiveFeedSimulation 
                                    isStolen={selectedDevice?.status === 'offline' && selectedDevice?.hardwareHealth === 0} 
                                    isHidden={selectedDevice?.sceneIntegrity === 0}
                                    isBroken={selectedDevice?.hardwareHealth === 0}
                                    neuralEnhance={true}
                                    fireHeatmapActive={fireHeatmapActive}
                                    isBreached={redAlertActive}
                                    nightVision={nightVision}
                                    thermal={thermalMode}
                                    aiOverlay={aiOverlay}
                                    zoom={zoom} pan={pan} tilt={tilt}
                                    deviceName={selectedDevice.name}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <div className={`text-7xl ${selectedDevice.isHoneypot ? 'text-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] animate-pulse' : 'text-cyan-500'} mb-6`}>
                                        <i className={`fas ${selectedDevice.isHoneypot ? 'fa-ghost' : 'fa-microchip'}`}></i>
                                    </div>
                                    <h3 className={`text-2xl font-black uppercase tracking-widest ${selectedDevice.isHoneypot ? 'text-purple-400' : ''}`}>
                                        {selectedDevice.isHoneypot ? t.honeypotActive : 'Neural Node Logic Active'}
                                    </h3>
                                    {selectedDevice.isHoneypot && (
                                        <div className="mt-6 space-y-2">
                                            <p className="text-[10px] font-mono text-purple-400 animate-pulse">DECEPTION_MATRIX_V4.2 // LAYER_ISOLATED</p>
                                            <div className="flex gap-2 justify-center">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-purple-500 opacity-50"></div>
                                                <div className="w-2 h-2 rounded-full bg-purple-500 opacity-20"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Voice Indicator Overlay */}
                            {isListening && (
                                <div className="absolute top-10 right-10 z-[100] flex items-center gap-4 bg-red-600/20 backdrop-blur px-6 py-3 rounded-full border border-red-500/40">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-1 h-4 bg-red-500 animate-[bounce_0.5s_infinite]"></div>
                                        <div className="w-1 h-6 bg-red-500 animate-[bounce_0.6s_infinite]"></div>
                                        <div className="w-1 h-3 bg-red-500 animate-[bounce_0.4s_infinite]"></div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-red-400 tracking-tighter">Voice Active</span>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute right-10 bottom-10 z-50 flex flex-col gap-4">
                                {selectedDevice.type === 'camera' && (
                                    <div className="grid grid-cols-3 gap-2 bg-black/60 backdrop-blur p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                                        <div></div>
                                        <button onClick={() => setTilt(p => p - 5)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-chevron-up"></i></button>
                                        <div></div>
                                        <button onClick={() => setPan(p => p - 5)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-chevron-left"></i></button>
                                        <button onClick={resetPTZ} className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDevice.isHoneypot ? 'bg-purple-600/20 text-purple-400' : 'bg-cyan-600/20 text-cyan-400'}`}><i className="fas fa-home"></i></button>
                                        <button onClick={() => setPan(p => p + 5)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-chevron-right"></i></button>
                                        <div></div>
                                        <button onClick={() => setTilt(p => p + 5)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-chevron-down"></i></button>
                                        <div></div>
                                    </div>
                                )}
                                <div className="flex gap-2 bg-black/60 backdrop-blur p-4 rounded-[2rem] border border-white/10">
                                    <button onClick={() => setZoom(p => Math.min(p + 0.2, 3))} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-plus"></i></button>
                                    <button onClick={() => setZoom(p => Math.max(p - 0.2, 1))} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><i className="fas fa-minus"></i></button>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="absolute left-10 bottom-10 z-50 flex gap-4">
                                {selectedDevice.type === 'camera' && (
                                    <>
                                        <button onClick={() => { setFlash(true); setTimeout(() => setFlash(false), 150); }} className="px-6 py-3 rounded-full bg-white text-black font-black uppercase text-[10px]">CAPTURE</button>
                                        <button onClick={() => setIsRecording(!isRecording)} className={`px-6 py-3 rounded-full font-black uppercase text-[10px] ${isRecording ? 'bg-red-600' : 'bg-white/10'} transition-all`}>
                                            {isRecording ? 'RECORDING...' : 'RECORD'}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setSelectedDevice(null)} className={`px-6 py-3 rounded-full font-black uppercase text-[10px] border transition-all ${selectedDevice.isHoneypot ? 'bg-purple-600/20 border-purple-500/30 text-purple-400' : 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400'}`}>GRID VIEW</button>
                            </div>
                        </div>

                        {/* Telemetry/Anomaly Panel */}
                        <div className="mt-10 grid grid-cols-2 gap-8">
                             <div className="p-8 bg-slate-900/40 rounded-[3rem] border border-white/5">
                                <h4 className={`text-[10px] font-black uppercase mb-4 ${selectedDevice.isHoneypot ? 'text-purple-400' : 'text-cyan-500'}`}>Node Profiling</h4>
                                <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-500">THREAT_LEVEL:</span>
                                        <span className={selectedDevice.profile?.criticality === ThreatLevel.CRITICAL ? 'text-red-500 font-black italic' : 'text-white'}>
                                            {selectedDevice.profile?.criticality}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-500">NODE_TYPE:</span>
                                        <span className="text-white uppercase font-bold">{selectedDevice.isHoneypot ? 'DECEPTIVE_HUB' : selectedDevice.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">HW_INTEGRITY:</span>
                                        <span className={selectedDevice.hardwareHealth && selectedDevice.hardwareHealth < 50 ? 'text-red-500' : 'text-cyan-400'}>{selectedDevice.hardwareHealth || 0}%</span>
                                    </div>
                                </div>
                             </div>
                             <div className="p-8 bg-slate-900/40 rounded-[3rem] border border-white/5">
                                <h4 className="text-[10px] font-black uppercase text-orange-500 mb-6">Manual Anomaly Simulator</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleManualAnomaly('HIDDEN')} className="py-4 bg-slate-800 rounded-2xl text-[9px] font-black uppercase border border-white/5 hover:bg-red-600/20 transition-all">Occlusion</button>
                                    <button onClick={() => handleManualAnomaly('BROKEN')} className="py-4 bg-slate-800 rounded-2xl text-[9px] font-black uppercase border border-white/5 hover:bg-red-600/20 transition-all">Impact</button>
                                    <button onClick={() => handleManualAnomaly('FIRE')} className="py-4 bg-orange-600/10 text-orange-500 rounded-2xl text-[9px] font-black uppercase border border-orange-500/20 hover:bg-orange-600/20 transition-all">Thermal</button>
                                    <button onClick={() => handleManualAnomaly('THEFT')} className="py-4 bg-red-600/10 text-red-500 rounded-2xl text-[9px] font-black uppercase border border-red-500/20 hover:bg-red-600/20 transition-all">Theft</button>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* SAFETY STUDIO MODAL */}
      {showSafetyStudio && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl">
            <div className="glass-panel w-full max-w-[1200px] rounded-[5rem] border border-orange-500/30 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-10 flex justify-between items-center bg-orange-600/5 border-b border-orange-500/20">
                    <h3 className="text-4xl font-black italic uppercase text-orange-500">{t.safetyStudio}</h3>
                    <button onClick={() => setShowSafetyStudio(false)} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl"><i className="fas fa-times"></i></button>
                </div>
                <div className="flex-1 p-10 grid grid-cols-12 gap-10 overflow-y-auto custom-scrollbar">
                    <div className="col-span-4 space-y-8">
                        <div className="p-8 bg-slate-900/50 rounded-[3rem] border border-white/5">
                            <h4 className="text-[11px] font-black uppercase text-orange-400 mb-6">{t.datasetManager}</h4>
                            <DatasetTree lang={appLang} />
                        </div>
                    </div>
                    <div className="col-span-8 flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center opacity-30">
                            <i className="fas fa-microchip text-7xl mb-4"></i>
                            <p className="font-black uppercase tracking-widest text-xs">Training Data Stream Offline</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ACCESSIBILITY MODAL */}
      {showAccessibility && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
            <div className="glass-panel w-full max-w-lg rounded-[3rem] p-12 border border-white/10">
                <h3 className="text-3xl font-black uppercase italic mb-10 title-gradient">{t.accessibilitySettings}</h3>
                <div className="space-y-6">
                    <button onClick={() => setAccessibility(prev => ({...prev, highContrast: !prev.highContrast}))} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-between px-8 border transition-all ${accessibility.highContrast ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-white/10 border-white/10'}`}>
                        <span>{t.highContrast}</span>
                        <span>{accessibility.highContrast ? 'ON' : 'OFF'}</span>
                    </button>
                    <button onClick={() => setAccessibility(prev => ({...prev, speechEnabled: !prev.speechEnabled}))} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-between px-8 border transition-all ${accessibility.speechEnabled ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/10 border-white/10'}`}>
                        <span>{t.voiceAssist}</span>
                        <span>{accessibility.speechEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                    <button onClick={() => {
                        const nextLang = appLang === 'en' ? 'hi' : 'en';
                        setAppLang(nextLang);
                        setAccessibility(prev => ({...prev, language: nextLang}));
                    }} className="w-full py-5 bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-between px-8 border border-white/10">
                        <span>Language / भाषा</span>
                        <span>{appLang === 'en' ? 'EN' : 'HI'}</span>
                    </button>
                    <button onClick={() => setShowAccessibility(false)} className="w-full py-5 bg-cyan-600 rounded-2xl font-black uppercase tracking-widest text-xs">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* CHATBOT */}
      <div className={`fixed bottom-8 right-8 z-[3000] w-[400px] flex flex-col transition-all duration-500 ${isChatOpen ? 'h-[550px]' : 'h-16'}`}>
         <div className="glass-panel w-full h-full rounded-[2.5rem] border border-cyan-500/20 overflow-hidden flex flex-col shadow-2xl">
            <div onClick={() => setIsChatOpen(!isChatOpen)} className="bg-cyan-600/10 p-6 flex justify-between items-center cursor-pointer border-b border-white/10">
                <span className="text-[11px] font-black uppercase tracking-widest">Sudarshan Security Chat</span>
                <i className={`fas ${isChatOpen ? 'fa-chevron-down' : 'fa-chevron-up'} text-white/50`}></i>
            </div>
            {isChatOpen && (
                <>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-xs">
                        {chatHistory.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-800 text-gray-300 border border-white/5'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-[9px] animate-pulse text-cyan-400 font-black">CONSULTING CORE...</div>}
                    </div>
                    <div className="p-4 flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="Ask security consultant..." />
                        <button onClick={handleSendChat} className="p-3 bg-cyan-500 rounded-xl text-black hover:scale-105 transition-all"><i className="fas fa-paper-plane"></i></button>
                    </div>
                </>
            )}
         </div>
      </div>
    </div>
  );
};

export default App;

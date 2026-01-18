
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export type LifecycleStage = 'DETECTION' | 'ANALYSIS' | 'CONTAINMENT' | 'REMEDIATION' | 'FORENSICS' | 'BREACH' | 'TRAINING';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface MitreMapping {
  tactic: string;
  technique: string;
  id: string;
}

export interface Vulnerability {
  cveId: string;
  cvss: number;
  description: string;
  relevanceToProfile: number;
  category: 'authentication' | 'network' | 'firmware' | 'exposure';
}

export interface ThreatProfile {
  id: string;
  name: string;
  criticality: ThreatLevel;
  description: string;
  expectedBehavior: string;
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'camera' | 'smart-plug' | 'thermostat' | 'hub' | 'lock' | 'gas-valve';
  status: 'online' | 'offline' | 'compromised';
  lastSeen: string;
  profile?: ThreatProfile;
  offlineAt?: number;
  tamperAlerted?: boolean;
  isHoneypot?: boolean;
  trapLogs?: string[];
  hardwareHealth?: number;
  sceneIntegrity?: number;
  breachActive?: boolean;
  shodanIntel?: {
    vulnerabilities: Vulnerability[];
    ports: number[];
    org?: string;
    lastScan: string;
  };
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  deviceId: string;
  type: string;
  severity: ThreatLevel;
  description: string;
  reasoning?: string;
  actionTaken?: string;
  forensicTrace?: string[];
  isHoneyTrigger?: boolean;
  currentStage: LifecycleStage;
  mitre?: MitreMapping;
  confidenceScore?: number;
  datasetSignature?: string;
  validationSources?: string[];
}

export interface AppLanguage {
  lang: 'en' | 'hi';
}

export interface AccessibilityConfig {
  highContrast: boolean;
  voiceAssist: boolean;
  largeTargets: boolean;
  simplifiedReadout: boolean;
  language: 'en' | 'hi';
  speechEnabled: boolean;
}

// New Types for Neural Safety Hub
export interface SafetyInterlock {
  id: string;
  trigger: string;
  action: string;
  isActive: boolean;
  deviceType: string;
}

export interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
}

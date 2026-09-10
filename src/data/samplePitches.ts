import { JudgeEvaluation, ChatMessage } from '../types';

export interface SamplePitchData {
  id: string;
  title: string;
  category: string;
  pitch: string;
  decision: 'ACCEPT' | 'REJECT' | 'UNDECIDED';
  evaluation: JudgeEvaluation;
  initialMessage: ChatMessage;
  judgeResponse: ChatMessage;
}

const EVALUATION_CYBERGUARD: JudgeEvaluation = {
  decision: 'ACCEPT',
  decisionReason: 'The board is extending a term sheet. Enterprise customer pull is proven by 4 Fortune 500 pilots at $120k ACV, and the zero-exfiltration VPC architecture dismantles the classic infosec adoption objection.',
  scores: {
    problem: 9,
    market: 9,
    differentiation: 8,
    businessModel: 9,
    traction: 8,
    team: 8,
    risk: 7,
  },
  judges: {
    ada: {
      name: 'Ada',
      role: 'Product Judge',
      quote: 'Zero-egress VPC deployment solves the absolute #1 enterprise compliance friction point on day zero.',
      feedback: 'SOC analysts are drowning in alert fatigue. By executing local sandbox forensics without sending PII outside customer boundaries, you convert a 6-month security review into a 2-week pilot.',
      verdict: 'bullish',
    },
    marcus: {
      name: 'Marcus',
      role: 'Business Judge',
      quote: '$120k ACV with 4 Fortune 500 logos demonstrates undeniable willingness to pay.',
      feedback: 'Enterprise annual contract values above six figures paired with a 3.2x pipeline multiple make this round an easy syndicate lead. Protect gross margins by monitoring inference compute costs per customer instance.',
      verdict: 'bullish',
    },
    priya: {
      name: 'Priya',
      role: 'Risk Judge',
      quote: 'Integration surface with fragmented enterprise SIEMs (Splunk, Sentinel) is your largest execution hazard.',
      feedback: 'If custom parser development slows down enterprise deployments, your onboarding cycle will balloon past 90 days. Build standardized connector SDKs before hiring additional SDRs.',
      verdict: 'neutral',
    },
  },
  questions: [
    'How many engineering hours does it currently take to deploy inside a new customer VPC?',
    'What is your gross margin profile when including the LLM inference cost of processing high-volume syslog feeds?',
  ],
  nextBestMove: 'Standardize one-click Helm/Terraform deployment scripts to compress enterprise onboarding from 3 weeks to under 48 hours.',
  rewrittenPitch: 'CyberGuard AI automates 85% of enterprise SOC triage through VPC-resident agentic forensics. Backed by 4 Fortune 500 pilots at $120k ACV and 3.2x YoY pipeline growth, we are raising $2M Seed to scale enterprise SIEM connectors.',
};

const EVALUATION_FLEETPULSE: JudgeEvaluation = {
  decision: 'UNDECIDED',
  decisionReason: 'The board is split. The retrofit concept provides a massive initial capex advantage over buying brand new AGVs, but hardware maintenance liabilities and OSHA safety certs remain unproven at scale.',
  scores: {
    problem: 8,
    market: 8,
    differentiation: 7,
    businessModel: 6,
    traction: 6,
    team: 7,
    risk: 5,
  },
  judges: {
    ada: {
      name: 'Ada',
      role: 'Product Judge',
      quote: 'Retrofit hardware is fantastic for quick sales demos, but mechanical drift across different forklift models is brutal.',
      feedback: 'Crown, Toyota, and Raymond forklifts have distinct hydraulic steering lag. Your edge vision models must handle dirty warehouse lighting and reflective shrink wrap flawlessly.',
      verdict: 'neutral',
    },
    marcus: {
      name: 'Marcus',
      role: 'Business Judge',
      quote: '$1,500/forklift/month is solid recurring revenue, provided you are not footing the hardware capex bill upfront.',
      feedback: 'If you are financing the sensor hardware onto your own balance sheet, your payback period stretches past 18 months. Require an upfront installation fee to keep cash flow positive.',
      verdict: 'neutral',
    },
    priya: {
      name: 'Priya',
      role: 'Risk Judge',
      quote: 'A single collision in a tight aisle with human workers is a catastrophic company-ending liability.',
      feedback: '99.8% uptime sounds good in software, but in industrial robotics, 0.2% downtime equates to dozens of warehouse stoppages or potential injury claims per month. Who carries the umbrella insurance?',
      verdict: 'skeptical',
    },
  },
  questions: [
    'What is your contractual liability structure if an autonomous retrofit forklift causes warehouse inventory damage?',
    'How many forklift models do you currently support with zero hardware modifications?',
  ],
  nextBestMove: 'Obtain third-party UL/ISO safety certification for your optical emergency-stop system before expanding beyond the 3 pilots.',
  rewrittenPitch: 'FleetPulse transforms existing warehouse forklifts into autonomous vehicles with plug-and-play sensor kits at $1,500/mo. Operating across 3 logistics hubs with 99.8% uptime, we are raising to scale our pre-certified hardware kits.',
};

const EVALUATION_NOMADBEDS: JudgeEvaluation = {
  decision: 'REJECT',
  decisionReason: 'The board passes. A 2,000-person landing page waitlist is not evidence of marketplace liquidity, and unmanaged landlord lease violations present severe regulatory and eviction exposure.',
  scores: {
    problem: 6,
    market: 6,
    differentiation: 4,
    businessModel: 3,
    traction: 2,
    team: 5,
    risk: 2,
  },
  judges: {
    ada: {
      name: 'Ada',
      role: 'Product Judge',
      quote: 'Two-sided home swapping has a fatal matching problem: everyone wants Lisbon in July and nobody wants Detroit in January.',
      feedback: 'Without inventory predictability and guaranteed cleaning standards, trust collapses immediately after the first bad apartment experience.',
      verdict: 'skeptical',
    },
    marcus: {
      name: 'Marcus',
      role: 'Business Judge',
      quote: 'Waitlist emails are free; acquiring high-LTV sublet inventory in competitive metros is brutally expensive.',
      feedback: 'Customer acquisition cost will swallow your transaction take-rate. Look at every sublease startup over the last decade—churn is virtually 100% per season.',
      verdict: 'skeptical',
    },
    priya: {
      name: 'Priya',
      role: 'Risk Judge',
      quote: '95% of residential leases legally forbid unapproved subletting. You are building on a regulatory minefield.',
      feedback: 'One tenant being evicted by a building landlord because of an illegal nomad swap will trigger immediate platform litigation. You have no indemnification plan.',
      verdict: 'skeptical',
    },
  },
  questions: [
    'How do you prevent building landlords from evicting primary tenants for unauthorized commercial sublets?',
    'What is your plan to balance seasonal geographic supply and demand without subsidizing empty rooms?',
  ],
  nextBestMove: 'Pivot to verified corporate subleases with direct landlord revenue-sharing agreements rather than unapproved consumer swapping.',
  rewrittenPitch: 'NomadBeds is a compliant mid-term housing platform enabling pre-screened remote workers to lease furnished apartments with direct landlord approval.',
};

export const SAMPLE_PITCHES: SamplePitchData[] = [
  {
    id: 'sample_cyberguard',
    title: 'CyberGuard AI',
    category: 'Enterprise Cybersecurity (ACCEPT)',
    decision: 'ACCEPT',
    pitch: 'CyberGuard AI is an automated incident response copilot for SOC teams that eliminates 85% of false-positive triage. We run agentic forensic workflows directly inside customer VPCs without extracting proprietary code or PII. We have 4 Fortune 500 pilots at $120k ACV, 3.2x YoY pipeline growth, seeking $2M Seed at $12M cap.',
    evaluation: EVALUATION_CYBERGUARD,
    initialMessage: {
      id: 'msg_sample_1_user',
      role: 'user',
      content: 'CyberGuard AI is an automated incident response copilot for SOC teams that eliminates 85% of false-positive triage. We run agentic forensic workflows directly inside customer VPCs without extracting proprietary code or PII. We have 4 Fortune 500 pilots at $120k ACV, 3.2x YoY pipeline growth, seeking $2M Seed at $12M cap.',
      timestamp: new Date().toISOString(),
    },
    judgeResponse: {
      id: 'msg_sample_1_judge',
      role: 'judges',
      content: 'The board has deliberated on CyberGuard AI: The VPC-resident architecture solves enterprise compliance hurdles, and $120k ACV traction proves willingness to pay. Term sheet extended.',
      evaluation: EVALUATION_CYBERGUARD,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'sample_fleetpulse',
    title: 'FleetPulse Robotics',
    category: 'Industrial Automation (CONDITIONAL)',
    decision: 'UNDECIDED',
    pitch: 'FleetPulse manufactures retrofittable LiDAR and camera kits that turn standard warehouse forklifts into autonomous guided vehicles for 1/5th the cost of new robotics. We charge $1,500/forklift/mo. Currently deployed in 3 third-party logistics hubs with 99.8% collision-free uptime.',
    evaluation: EVALUATION_FLEETPULSE,
    initialMessage: {
      id: 'msg_sample_2_user',
      role: 'user',
      content: 'FleetPulse manufactures retrofittable LiDAR and camera kits that turn standard warehouse forklifts into autonomous guided vehicles for 1/5th the cost of new robotics. We charge $1,500/forklift/mo. Currently deployed in 3 third-party logistics hubs with 99.8% collision-free uptime.',
      timestamp: new Date().toISOString(),
    },
    judgeResponse: {
      id: 'msg_sample_2_judge',
      role: 'judges',
      content: 'The board is conditionally interested. The capex savings are compelling, but safety certification and hardware warranty liabilities must be clarified before capital allocation.',
      evaluation: EVALUATION_FLEETPULSE,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'sample_nomadbeds',
    title: 'NomadBeds',
    category: 'Consumer Marketplace (REJECT)',
    decision: 'REJECT',
    pitch: 'NomadBeds is a peer-to-peer subletting app for digital nomads to swap apartments monthly without broker fees or lease breaks. 2,000 waitlist signups, seeking $1M pre-seed.',
    evaluation: EVALUATION_NOMADBEDS,
    initialMessage: {
      id: 'msg_sample_3_user',
      role: 'user',
      content: 'NomadBeds is a peer-to-peer subletting app for digital nomads to swap apartments monthly without broker fees or lease breaks. 2,000 waitlist signups, seeking $1M pre-seed.',
      timestamp: new Date().toISOString(),
    },
    judgeResponse: {
      id: 'msg_sample_3_judge',
      role: 'judges',
      content: 'The board has voted to pass. Legal subleasing covenants and lack of transaction liquidity make this uninvestable in its current structure.',
      evaluation: EVALUATION_NOMADBEDS,
      timestamp: new Date().toISOString(),
    },
  },
];

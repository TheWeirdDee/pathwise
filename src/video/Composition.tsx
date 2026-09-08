import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Subtitles data
const SUBTITLES = [
  { start: 0, end: 240, text: 'Market buying is not always the cheapest way to execute the same Binance intent. Pathwise checks the paths first.' },
  { start: 280, end: 680, text: 'Pathwise is an execution operator for Binance Agent OS. You tell it what you want done; it prices the available routes after fees, Convert, wallet location and funding, then deterministically selects one winner.' },
  { start: 730, end: 1240, text: "Here's the intent: buy two hundred USDT of SOL and hold it for twenty-four hours. Pathwise turns that sentence into a constrained execution problem. It isn't deciding whether SOL goes up. It is deciding how to execute the intent efficiently." },
  { start: 1270, end: 1590, text: 'First, Pathwise looks at where the capital actually sits. Spot and USD-M are different execution pockets, so moving funds can itself be part of the route.' },
  { start: 1630, end: 2440, text: 'Now the important part. Pathwise does not ask an LLM to guess the best route. Its deterministic scorer enumerates the legal paths and puts them in the same unit: all-in USDT cost. That can include spread, fees, book impact, Convert pricing, funding across the hold horizon, and any wallet transfer required to make the route executable. Unsupported paths stay visible rather than being silently replaced.' },
  { start: 2500, end: 2920, text: 'For this recorded fixture, Binance Convert wins. The same two-hundred-dollar intent is estimated at seventeen cents less than the Spot market baseline. The route is selected by the score, not by the model.' },
  { start: 2980, end: 3380, text: 'In this submission environment, the execution is reproduced as a recorded fixture, so no real fill is claimed. Once approved, Pathwise evaluates only the winning plan, without spraying unverified orders.' },
  { start: 3430, end: 3960, text: 'Choosing the route isn\'t enough. Pathwise writes a receipt containing the original intent, every scored path, the selected winner, and the evidence behind the result. That receipt can be recomputed from its recorded inputs, so the cents result does not depend on trusting the narration.' },
  { start: 4030, end: 4650, text: 'The agent\'s job here is operational, not advisory. Binance supplies the account and market primitives; Pathwise turns those primitives into one deterministic execution decision. The key insight is that Convert and internal wallet transfers aren\'t setup steps. They\'re competing execution legs with their own costs and clocks.' },
  { start: 4690, end: 5090, text: 'And the evaluation doesn\'t have to stop at one favorable screenshot. The campaign runner freezes the comparison set in advance across five assets, notionals, and horizons, keeping the losses and blocked routes too.' },
  { start: 5130, end: 5240, text: 'Pathwise. One intent. Every viable path. Every cent accounted for.' },
];

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active subtitle
  const activeSub = SUBTITLES.find((s) => frame >= s.start && frame <= s.end);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0e14', color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ================= AUDIO TRACKS ================= */}
      <Sequence from={0} durationInFrames={250}>
        <Audio src={staticFile('audio/01_hook.mp3')} volume={1} />
      </Sequence>
      <Sequence from={280} durationInFrames={410}>
        <Audio src={staticFile('audio/02_intro.mp3')} volume={1} />
      </Sequence>
      <Sequence from={730} durationInFrames={520}>
        <Audio src={staticFile('audio/03_intent.mp3')} volume={1} />
      </Sequence>
      <Sequence from={1270} durationInFrames={325}>
        <Audio src={staticFile('audio/04_wallet.mp3')} volume={1} />
      </Sequence>
      <Sequence from={1630} durationInFrames={820}>
        <Audio src={staticFile('audio/05_scoring.mp3')} volume={1} />
      </Sequence>
      <Sequence from={2500} durationInFrames={425}>
        <Audio src={staticFile('audio/06_hero.mp3')} volume={1} />
      </Sequence>
      <Sequence from={2980} durationInFrames={405}>
        <Audio src={staticFile('audio/07_execute.mp3')} volume={1} />
      </Sequence>
      <Sequence from={3430} durationInFrames={540}>
        <Audio src={staticFile('audio/08_receipt.mp3')} volume={1} />
      </Sequence>
      <Sequence from={4030} durationInFrames={630}>
        <Audio src={staticFile('audio/09_mechanism.mp3')} volume={1} />
      </Sequence>
      <Sequence from={4690} durationInFrames={405}>
        <Audio src={staticFile('audio/10_campaign.mp3')} volume={1} />
      </Sequence>
      <Sequence from={5130} durationInFrames={250}>
        <Audio src={staticFile('audio/11_outro.mp3')} volume={1} />
      </Sequence>

      {/* ================= SCENE 0: THE HOOK (0 - 270) ================= */}
      <Sequence from={0} durationInFrames={270}>
        <SceneHook frame={frame} fps={fps} />
      </Sequence>

      {/* ================= SCENE 1: PRODUCT INTRO (270 - 720) ================= */}
      <Sequence from={270} durationInFrames={450}>
        <SceneIntro frame={frame - 270} fps={fps} />
      </Sequence>

      {/* ================= SCENE 2: INTENT INPUT (720 - 1260) ================= */}
      <Sequence from={720} durationInFrames={540}>
        <SceneIntent frame={frame - 720} fps={fps} />
      </Sequence>

      {/* ================= SCENE 3: WALLET MAP (1260 - 1620) ================= */}
      <Sequence from={1260} durationInFrames={360}>
        <SceneWallet frame={frame - 1260} fps={fps} />
      </Sequence>

      {/* ================= SCENE 4: SCORING MECHANISM (1620 - 2490) ================= */}
      <Sequence from={1620} durationInFrames={870}>
        <SceneScoring frame={frame - 1620} fps={fps} />
      </Sequence>

      {/* ================= SCENE 5: HERO WINNING SCREENSHOT (2490 - 2970) ================= */}
      <Sequence from={2490} durationInFrames={480}>
        <SceneHero frame={frame - 2490} fps={fps} />
      </Sequence>

      {/* ================= SCENE 6: EXECUTION / REPLAY (2970 - 3420) ================= */}
      <Sequence from={2970} durationInFrames={450}>
        <SceneExecute frame={frame - 2970} fps={fps} />
      </Sequence>

      {/* ================= SCENE 7: RECEIPT & PROOF (3420 - 4020) ================= */}
      <Sequence from={3420} durationInFrames={600}>
        <SceneReceipt frame={frame - 3420} fps={fps} />
      </Sequence>

      {/* ================= SCENE 8: AGENT OS ARCHITECTURE (4020 - 4680) ================= */}
      <Sequence from={4020} durationInFrames={660}>
        <SceneAgentOS frame={frame - 4020} fps={fps} />
      </Sequence>

      {/* ================= SCENE 9: CAMPAIGN BENCHMARK (4680 - 5130) ================= */}
      <Sequence from={4680} durationInFrames={450}>
        <SceneCampaign frame={frame - 4680} fps={fps} />
      </Sequence>

      {/* ================= SCENE 10: FINAL CLOSE (5130 - 5250) ================= */}
      <Sequence from={5130} durationInFrames={120}>
        <SceneOutro frame={frame - 5130} fps={fps} />
      </Sequence>

      {/* ================= GLOBAL TOP BAR BADGE ================= */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 90,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f0b90b', boxShadow: '0 0 10px #f0b90b' }} />
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#f0b90b', textTransform: 'uppercase' }}>
          BINANCE AGENT OS · TRACK A
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 13 }}>|</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>
          Pathwise Execution Operator
        </span>
      </div>

      {/* ================= SUBTITLES BAR ================= */}
      {activeSub && (
        <div style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 1280,
          backgroundColor: 'rgba(10, 14, 23, 0.92)',
          backdropFilter: 'blur(14px)',
          padding: '14px 28px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
          zIndex: 100,
        }}>
          <p style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.4,
            color: '#ffffff',
            letterSpacing: '0.01em',
          }}>
            {activeSub.text}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* =========================================================================
   SCENE COMPONENTS
========================================================================= */

// SCENE 0: THE HOOK
const SceneHook: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 270], [1.02, 1.08]);
  const overlayOpacity = interpolate(frame, [0, 20, 240, 270], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/hero_winning_screenshot_1080p.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: 'brightness(0.92)',
        }}
      />
      <div style={{
        position: 'absolute',
        top: 100,
        left: 80,
        opacity: overlayOpacity,
        backgroundColor: 'rgba(15, 20, 30, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(240, 185, 11, 0.4)',
        padding: '24px 36px',
        borderRadius: 16,
        maxWidth: 760,
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(240, 185, 11, 0.15)', color: '#f0b90b', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          THE EXECUTION ARBITRAGE
        </div>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
          Same Trade. Different Path. Different Cost.
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 18, color: '#9ca3af', lineHeight: 1.5 }}>
          Pathwise prices all 13 available Binance routes and deterministically takes the cheapest one.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 1: PRODUCT INTRO
const SceneIntro: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 450], [1.0, 1.04]);
  const cardY = interpolate(frame, [0, 30], [40, 0]);
  const cardOpacity = interpolate(frame, [0, 25], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/01_overview_full.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 100,
        right: 80,
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '24px 32px',
        borderRadius: 16,
        maxWidth: 580,
        boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', letterSpacing: '0.05em', marginBottom: 8 }}>
          CORE PRINCIPLE
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: 12 }}>
          INTENT → PRICE EVERY ROUTE → EXECUTE THE WINNER
        </div>
        <p style={{ margin: 0, fontSize: 16, color: '#9ca3af', lineHeight: 1.5 }}>
          Not price prediction. Not speculative AI advice. Pure deterministic execution path optimization.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2: INTENT INPUT
const SceneIntent: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 540], [1.05, 1.12]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/01_overview_full.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(-80px, -60px)`,
        }}
      />
      {/* Highlighting the Intent Box */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: 300,
        width: 820,
        height: 240,
        border: '2px solid #f0b90b',
        borderRadius: 16,
        boxShadow: '0 0 30px rgba(240, 185, 11, 0.3)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 410,
        left: 300,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        border: '1px solid rgba(240, 185, 11, 0.4)',
        padding: '16px 24px',
        borderRadius: 12,
        maxWidth: 600,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0b90b', marginBottom: 4 }}>
          NATURAL LANGUAGE CONSTRAINTS
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
          &ldquo;Buy 200 USDT of SOL, hold 24h&rdquo;
        </div>
        <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
          Parses asset, quote notional, side, and time horizon into an exact mathematical scoring payload.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 3: WALLET MAP
const SceneWallet: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 360], [1.02, 1.06]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/04b_usdm_pocket_overview.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 140,
        right: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        padding: '24px 30px',
        borderRadius: 16,
        maxWidth: 540,
        boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 8 }}>
          MULTI-POCKET TOPOLOGY
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
          Wallet Location Is Part of the Price
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 16, color: '#9ca3af', lineHeight: 1.5 }}>
          Spot, USD-M Futures, and Funding wallets are distinct execution pockets. Transfers between them are scored directly as first-class route legs.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 4: SCORING MECHANISM
const SceneScoring: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 870], [1.02, 1.07]);

  // Sequential highlights for the 6 cost terms
  const termIdx = Math.min(5, Math.floor(frame / 120));
  const terms = [
    { title: '1. SPREAD & ORDER BOOK DEPTH', desc: 'Walks the fixture L2 book, charging exact depth levels.' },
    { title: '2. TAKER & MAKER FEES', desc: 'Applies VIP tier fee structure to each individual leg.' },
    { title: '3. CONVERT RFQ PRICING', desc: 'Compares zero-fee RFQ quote against spot order book depth.' },
    { title: '4. HOLDING FUNDING RATES', desc: 'Projects 8h funding payments across the 24h hold horizon.' },
    { title: '5. INTERNAL WALLET TRANSFERS', desc: 'Adds latency and transfer requirements when funds sit in USD-M.' },
    { title: '6. ALL-IN USDT COMPARISON', desc: 'Reduces all 13 routes to one comparable, deterministic all-in cost.' },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/01_overview_full.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(-40px, 80px)`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 90,
        left: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(240, 185, 11, 0.4)',
        padding: '20px 28px',
        borderRadius: 14,
        maxWidth: 620,
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', marginBottom: 4 }}>
          DETERMINISTIC COST SCORER · TERM {termIdx + 1} OF 6
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
          {terms[termIdx].title}
        </div>
        <div style={{ fontSize: 15, color: '#9ca3af', marginTop: 6, lineHeight: 1.4 }}>
          {terms[termIdx].desc}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 5: HERO WINNING SCREENSHOT
const SceneHero: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 480], [1.02, 1.09]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/hero_winning_screenshot_1080p.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      {/* Highlighting Card */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        right: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '2px solid #10b981',
        padding: '24px 32px',
        borderRadius: 16,
        maxWidth: 580,
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
            ✦ THE WINNING PATH
          </span>
          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
            FIXTURE ESTIMATE
          </span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
          Binance Convert
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
          −17.00¢ vs. Spot baseline
        </div>
        <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.4 }}>
          Convert all-in: <strong>$200.0646</strong> vs Spot taker: <strong>$200.2346</strong>. Pure deterministic selection based on RFQ advantage.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 6: EXECUTION / REPLAY
const SceneExecute: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 450], [1.02, 1.06]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/06_execution_modal.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 100,
        left: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '24px 30px',
        borderRadius: 16,
        maxWidth: 520,
        boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', marginBottom: 8 }}>
          SAFE EXECUTION PROTOCOL
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
          One Intent → At Most One Execution Plan
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 15, color: '#9ca3af', lineHeight: 1.5 }}>
          Pathwise never sprays multiple live routes. Every step is sequentially locked, acknowledged, and recorded into the verifiable ledger.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 7: RECEIPT & PROOF
const SceneReceipt: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 600], [1.02, 1.07]);
  const isSecondHalf = frame > 280;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(isSecondHalf ? 'capture/09_receipt_verified_match.png' : 'capture/07_receipts_page.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 100,
        right: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.5)',
        padding: '24px 32px',
        borderRadius: 16,
        maxWidth: 540,
        boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
            CRYPTOGRAPHIC PROOF
          </span>
          <span style={{ backgroundColor: '#10b981', color: '#0b0e14', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 800 }}>
            MATCH
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
          Intent In. Proof Out.
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 15, color: '#9ca3af', lineHeight: 1.5 }}>
          Every receipt records the complete input snapshot, scored paths, and SHA-256 canonical hash. Anyone can recompute the score and verify the match.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 8: AGENT OS ARCHITECTURE
const SceneAgentOS: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 660], [1.02, 1.06]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/10_proof_explorer.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 120,
        left: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        border: '1px solid rgba(240, 185, 11, 0.4)',
        padding: '28px 36px',
        borderRadius: 16,
        maxWidth: 640,
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', marginBottom: 12 }}>
          WHY THIS IS BINANCE AGENT OS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0b90b' }}>1. AI Parses</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Extracts intent constraints without deciding money.</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>2. Scorer Decides</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Pure deterministic math prices all 13 routes.</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>3. Binance Executes</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Atomic execution of the single cheapest legal route.</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ec4899' }}>4. Receipt Proves</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Verifiable replay ledger with SHA-256 integrity.</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 9: CAMPAIGN BENCHMARK
const SceneCampaign: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 450], [1.02, 1.06]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile('capture/11_campaign_page.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <div style={{
        position: 'absolute',
        top: 100,
        right: 80,
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '24px 30px',
        borderRadius: 16,
        maxWidth: 540,
        boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', marginBottom: 8 }}>
          NO SELECTIVE SCREENSHOTS
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
          120 Benchmark Attempts Across 6 Ablations
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 15, color: '#9ca3af', lineHeight: 1.5 }}>
          Evaluated across 5 symbols (BTC, ETH, SOL, BNB, XRP), multiple notionals, wallets, and horizons. Losses and blocked paths are preserved.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 10: FINAL CLOSE
const SceneOutro: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0b0e14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 32px',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(240, 185, 11, 0.3)',
        boxShadow: '0 0 60px rgba(240, 185, 11, 0.15)',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0b90b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b0e14" strokeWidth="2.5">
            <path d="M4 17l6-6-6-6M12 19h8" />
          </svg>
        </div>
        <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
          pathwise.
        </h1>
      </div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#f0b90b', letterSpacing: '0.04em' }}>
        One intent. Every viable path. Every cent accounted for.
      </p>
      <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Binance Agent OS · Track A Submission
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import { Sequence } from 'remotion';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { SceneIntro } from './components/SceneIntro';
import { ScenePrivacy } from './components/ScenePrivacy';
import { SceneMining } from './components/SceneMining';
import { SceneSimulation } from './components/SceneSimulation';
import { SceneVerification } from './components/SceneVerification';
import { SceneOutro } from './components/SceneOutro';

export const AutoFlowVideo = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        backgroundColor: '#0a0f1d',
        overflow: 'hidden',
      }}
    >
      {/* Persistent Animated Background */}
      <Background />

      {/* Persistent Sleek Header Status Bar */}
      <Header />

      {/* Scene 1: Introduction & Problem Hook (0 - 6.3s) */}
      <Sequence from={0} durationInFrames={190}>
        <SceneIntro />
      </Sequence>

      {/* Scene 2: Privacy-Preserving Event Ingestion (6.3s - 12.6s) */}
      <Sequence from={190} durationInFrames={190}>
        <ScenePrivacy />
      </Sequence>

      {/* Scene 3: Pattern Mining & Directed Graph (12.6s - 19.0s) */}
      <Sequence from={380} durationInFrames={190}>
        <SceneMining />
      </Sequence>

      {/* Scene 4: AI Intent Inference & Safe Simulation (19.0s - 25.3s) */}
      <Sequence from={570} durationInFrames={190}>
        <SceneSimulation />
      </Sequence>

      {/* Scene 5: Controlled Execution & Independent Verification (25.3s - 31.6s) */}
      <Sequence from={760} durationInFrames={190}>
        <SceneVerification />
      </Sequence>

      {/* Scene 6: Core Philosophy & Outro (31.6s - 38.0s) */}
      <Sequence from={950} durationInFrames={190}>
        <SceneOutro />
      </Sequence>
    </div>
  );
};

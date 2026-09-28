import React from 'react';
import { Composition } from 'remotion';
import { AutoFlowVideo } from './AutoFlowVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AutoFlowVideo"
        component={AutoFlowVideo}
        durationInFrames={1140}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

import { Composition } from 'remotion';
import { MainVideo } from './Composition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="PathwiseDemo"
        component={MainVideo}
        durationInFrames={5250} // 175.0s (02:55.000) - Strictly under 5310 frames (177.0s / 02:57.000 max)
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

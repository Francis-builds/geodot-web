import React from "react";
import { Composition } from "remotion";
import { S1Yard, S1_DURATION } from "./scenes/S1Yard";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="s1-yard"
      component={S1Yard}
      durationInFrames={S1_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
  </>
);

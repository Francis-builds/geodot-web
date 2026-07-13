import React from "react";
import { Composition } from "remotion";
import { S1Yard, S1_DURATION } from "./scenes/S1Yard";
import { S2Pack, S2_DURATION } from "./scenes/S2Pack";
import { AssetShowcase, SHOWCASE_DURATION } from "./scenes/AssetShowcase";
import { S3Fill, S3_DURATION } from "./scenes/S3Fill";
import { S4Dock, S4_DURATION } from "./scenes/S4Dock";
import { S5Unload, S5_DURATION } from "./scenes/S5Unload";

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
    <Composition
      id="s2-pack"
      component={S2Pack}
      durationInFrames={S2_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
    <Composition
      id="s3-fill"
      component={S3Fill}
      durationInFrames={S3_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
    <Composition
      id="s4-dock"
      component={S4Dock}
      durationInFrames={S4_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
    <Composition
      id="s5-unload"
      component={S5Unload}
      durationInFrames={S5_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
    <Composition
      id="assets"
      component={AssetShowcase}
      durationInFrames={SHOWCASE_DURATION}
      fps={24}
      width={1920}
      height={1080}
    />
  </>
);

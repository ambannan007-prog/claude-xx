import { Composition } from "remotion";
import { ErnakulamReel, FPS, REEL_FRAMES } from "./ErnakulamReel";
import { HelloWorld } from "./HelloWorld";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ErnakulamReel"
        component={ErnakulamReel}
        durationInFrames={REEL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

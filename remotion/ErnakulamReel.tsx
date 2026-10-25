import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont({
  family: "Noto Sans Malayalam",
  url: staticFile("fonts/NotoSansMalayalam-800.woff2"),
  weight: "800",
});

const FONT = '"Noto Sans Malayalam", "Noto Color Emoji", sans-serif';
const YELLOW = "#FFE100";

export const FPS = 24;
// Source clip is 6.016s; the end card adds 2s on top.
export const CLIP_FRAMES = 144;
export const END_CARD_FRAMES = 48;
export const REEL_FRAMES = CLIP_FRAMES + END_CARD_FRAMES;

const s = (seconds: number) => Math.round(seconds * FPS);

// Timings come from the audio energy: speech runs 0.7s–4.9s, with a gap at
// 2.8–3.0s right before he points at the camera.
const CAPTIONS: { from: number; to: number; parts: { text: string; hl?: boolean }[] }[] = [
  { from: 0.7, to: 1.6, parts: [{ text: "എറണാകുളത്തുനിന്ന്" }] },
  { from: 1.6, to: 2.3, parts: [{ text: "ലാപ്ടോപ്പ്", hl: true }, { text: " വാങ്ങാൻ" }] },
  { from: 2.3, to: 3.05, parts: [{ text: "പ്ലാനുണ്ടെങ്കിൽ" }] },
  { from: 3.05, to: 4.0, parts: [{ text: "ഈയൊരു കാര്യം", hl: true }, { text: " 👆" }] },
  { from: 4.0, to: 5.0, parts: [{ text: "ഉറപ്പായും", hl: true }, { text: " അറിഞ്ഞിരിക്കുക!" }] },
];

const POINT_AT = s(3.05);

const outline = "0 0 6px #000, 0 0 3px #000, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000";

const Caption: React.FC<{ parts: { text: string; hl?: boolean }[] }> = ({ parts }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const scale = interpolate(pop, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 520 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1.35,
          color: "white",
          textAlign: "center",
          textShadow: outline,
          padding: "0 40px",
          transform: `scale(${scale})`,
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={{ color: p.hl ? YELLOW : "white" }}>
            {p.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const HookBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const exit = interpolate(frame, [s(4.6), s(5.0)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 58,
          whiteSpace: "nowrap",
          color: "white",
          background: "#E0242B",
          padding: "20px 44px",
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          transform: `scale(${enter}) rotate(-2deg)`,
          opacity: exit,
        }}
      >
        💻 ലാപ്ടോപ്പ് വാങ്ങും മുൻപ്…
      </div>
    </AbsoluteFill>
  );
};

const Suspense: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.12 * Math.sin((frame / FPS) * Math.PI * 4);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `rgba(0,0,0,${0.35 * fadeIn})`,
      }}
    >
      <div style={{ fontSize: 260, fontFamily: FONT, transform: `scale(${pulse})`, opacity: fadeIn }}>❓</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blur = interpolate(frame, [0, 10], [0, 18], { extrapolateRight: "clamp" });
  const slide = spring({ frame: frame - 4, fps, config: { damping: 15 } });
  const bell = Math.sin((frame / FPS) * Math.PI * 6) * 12;

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("laptop-ernakulam-last.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: `blur(${blur}px) brightness(0.6)` }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            transform: `translateY(${interpolate(slide, [0, 1], [900, 0])}px)`,
            background: "rgba(255,255,255,0.96)",
            borderRadius: 40,
            padding: "70px 60px",
            width: 880,
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 800,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontSize: 64, color: "#111", lineHeight: 1.4 }}>അടുത്ത വീഡിയോയിൽ അറിയാം 👉</div>
          <div
            style={{
              marginTop: 44,
              display: "inline-block",
              fontSize: 72,
              color: "white",
              background: "#E0242B",
              padding: "18px 56px",
              borderRadius: 999,
            }}
          >
            Follow ചെയ്യൂ <span style={{ display: "inline-block", transform: `rotate(${bell}deg)` }}>🔔</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ErnakulamReel: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow push-in across the clip, plus a quick punch-in when he points.
  const slowZoom = interpolate(frame, [0, CLIP_FRAMES], [1, 1.05]);
  const punch = interpolate(frame, [POINT_AT, POINT_AT + 4, POINT_AT + 14], [0, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame, [POINT_AT, POINT_AT + 1, POINT_AT + 5], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={CLIP_FRAMES}>
        <AbsoluteFill style={{ transform: `scale(${slowZoom + punch})` }}>
          <OffthreadVideo
            src={staticFile("laptop-ernakulam.mp4")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "contrast(1.1) saturate(1.12) sepia(0.08) brightness(1.02)",
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
        <HookBanner />
        {CAPTIONS.map((c) => (
          <Sequence key={c.from} from={s(c.from)} durationInFrames={s(c.to) - s(c.from)}>
            <Caption parts={c.parts} />
          </Sequence>
        ))}
        <Sequence from={s(5.0)}>
          <Suspense />
        </Sequence>
      </Sequence>
      <Sequence from={CLIP_FRAMES} durationInFrames={END_CARD_FRAMES}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

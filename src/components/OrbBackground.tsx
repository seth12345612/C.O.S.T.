interface OrbBackgroundProps {
  bgClass?: string;
}

export function OrbBackground({ bgClass }: OrbBackgroundProps) {
  return (
    <>
      <div
        className={`fixed inset-0 -z-10 ${bgClass ?? ""}`}
        style={{ background: bgClass ? undefined : "hsl(270 15% 6%)" }}
      />
      <div className="grid-overlay -z-10" />
      <div className="orb-container -z-10">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    </>
  );
}

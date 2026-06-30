export default function PageHeaderBg() {
  return (
    <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-br from-indigo-900 via-primary to-indigo-800 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#f1f5f9] to-transparent"></div>
    </div>
  );
}

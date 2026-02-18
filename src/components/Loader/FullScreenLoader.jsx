// components/Loader/FullScreenLoader.jsx

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-black/40 z-[2000]">
      <span className="w-10 h-10 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default FullScreenLoader;

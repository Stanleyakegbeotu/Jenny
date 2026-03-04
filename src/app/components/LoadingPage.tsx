import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function LoadingPage() {
  const [isVisible, setIsVisible] = useState(true);

  // Hide splash screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.8 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary via-primary/95 to-primary/90 dark:from-primary/20 dark:via-primary/15 dark:to-accent/10 flex items-center justify-center"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orb 1 */}
        <motion.div
          className="absolute top-20 -left-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating orb 2 */}
        <motion.div
          className="absolute bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Floating orb 3 */}
        <motion.div
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -25, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Animated logo/icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* Rotating border */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80 border-r-white/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner circle with text */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center">
              <motion.span
                className="text-3xl font-bold text-white font-playfair"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                NJ
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Main title - character by character */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white tracking-wide">
              NENSHA JENNIFER
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-xl md:text-2xl text-white/90 font-light tracking-widest">
              BOOKS
            </p>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-white/70 text-sm md:text-base max-w-xs mx-auto"
        >
          Discover Cinematic Stories
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="pt-8"
        >
          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/60"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Loading text */}
          <motion.p
            className="text-white/50 text-xs mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

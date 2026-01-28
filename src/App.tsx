import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import './App.css';

type AccuracyColor = '#10b981' | '#f59e0b' | '#ef4444';
type WPMColor = '#10b981' | '#f59e0b' | '#ef4444';

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const [time, setTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [typedWords, setTypedWords] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const wordList = useMemo(() => [
    "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
    "programming", "computers", "experience", "success", "failure",
    "courage", "counts", "technology", "future", "dreams", "coding",
    "solutions", "innovation", "opportunity", "purpose", "journey",
    "thousand", "miles", "begins", "step", "create", "design",
    "developer", "software", "application", "website", "mobile",
    "desktop", "server", "database", "network", "security",
    "algorithm", "function", "variable", "constant", "interface",
    "component", "module", "system", "process", "framework"
  ], []);

  const calculateResults = useCallback(() => {
    const minutes = (60 - time) / 60;
    const calculatedWpm = minutes > 0 ? Math.round(typedWords / minutes) : 0;
    setWpm(calculatedWpm);

    const correctChars = totalCharsTyped - errors;
    const calculatedAccuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 100;
    setAccuracy(calculatedAccuracy);
  }, [time, typedWords, totalCharsTyped, errors]);

  const generateNewWords = useCallback(() => {
    const newWords: string[] = [];
    for (let i = 0; i < 50; i++) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      newWords.push(randomWord);
    }
    setWords(newWords);
    setCurrentWordIndex(0);
    setInput('');
  }, [wordList]);

  // Initialize words
  useEffect(() => {
    generateNewWords();
  }, [generateNewWords]);

  const startTest = useCallback(() => {
    if (!isRunning && !isFinished) {
      setIsRunning(true);
      inputRef.current?.focus();

      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsRunning(false);
            setIsFinished(true);
            calculateResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, isFinished, calculateResults]);

  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    generateNewWords();
    setInput('');
    setTime(60);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTypedWords(0);
    setErrors(0);
    setTotalCharsTyped(0);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isRunning && value.length > 0) {
      startTest();
    }
    
    const currentWord = words[currentWordIndex] || '';
    
    // Check if space was pressed (word completed)
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      
      // Calculate errors for this word
      let wordErrors = 0;
      for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
        if (typedWord[i] !== currentWord[i]) {
          wordErrors++;
        }
      }
      wordErrors += Math.abs(typedWord.length - currentWord.length);
      
      setErrors(prev => prev + wordErrors);
      setTypedWords(prev => prev + 1);
      setTotalCharsTyped(prev => prev + typedWord.length);
      
      // Move to next word
      setCurrentWordIndex(prev => {
        const newIndex = prev + 1;
        if (newIndex >= words.length) {
          // All words typed
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRunning(false);
          setIsFinished(true);
          calculateResults();
        }
        return newIndex;
      });
      
      setInput('');
    } else {
      setInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isFinished) {
      resetTest();
    }
    
    // Allow all key combinations (including Ctrl+V for paste)
    // No restrictions on copy/paste
  };

  // Prevent text selection on the words container
  useEffect(() => {
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('selectstart', handleSelectStart);
    }

    return () => {
      if (container) {
        container.removeEventListener('selectstart', handleSelectStart);
      }
    };
  }, []);

  // Get accuracy color
  const getAccuracyColor = (): AccuracyColor => {
    if (accuracy >= 90) return '#10b981';
    if (accuracy >= 80) return '#f59e0b';
    return '#ef4444';
  };

  // Get WPM color
  const getWPMColor = (): WPMColor => {
    if (wpm >= 60) return '#10b981';
    if (wpm >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate progress percentage
  const progressPercentage = (currentWordIndex / words.length) * 100;

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-shape"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="container">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="title">
            {/*<Keyboard className="title-icon" />*/}
            SpeedType Pro
          </h1>
          <p className="subtitle">Type words as fast as you can!</p>
        </motion.header>

        <main className="main-content">
          {/* Stats Row */}
          <div className="stats-row">
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ 
                  scale: isRunning ? [1, 1.02, 1] : 1
                }}
                transition={{ 
                  duration: 1, 
                  repeat: isRunning ? Infinity : 0 
                }}
                className="timer-container"
              >
                <Clock className="stat-icon" />
                <span className="stat-value">{time}s</span>
              </motion.div>
              <span className="stat-label">Time Remaining</span>
            </motion.div>

            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="stat-icon" style={{ color: getWPMColor() }} />
              <span className="stat-value" style={{ color: getWPMColor() }}>
                {wpm}
              </span>
              <span className="stat-label">Words Per Minute</span>
            </motion.div>

            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="accuracy-ring">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="#ddd"
                    strokeWidth="5"
                  />
                  <motion.circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke={getAccuracyColor()}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 25}`}
                    strokeDashoffset={`${2 * Math.PI * 25 * (1 - accuracy / 100)}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 25 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 25 * (1 - accuracy / 100) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="accuracy-value" style={{ color: getAccuracyColor() }}>
                  {accuracy}%
                </span>
              </div>
              <span className="stat-label">Accuracy</span>
            </motion.div>
          </div>

          {/* Words Display - Non-selectable */}
          <motion.div 
            ref={containerRef}
            className="words-display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="words-container" style={{ userSelect: 'none' }}>
              {words.map((word, index) => (
                <motion.span
                  key={index}
                  className={`word ${
                    index === currentWordIndex ? 'current' :
                    index < currentWordIndex ? 'completed' : 'upcoming'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: index === currentWordIndex ? 1.05 : 1
                  }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.01
                  }}
                >
                  {word}
                  {index === currentWordIndex && (
                    <motion.div 
                      className="cursor-indicator"
                      animate={{ 
                        opacity: [1, 0.5, 1],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity 
                      }}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  )}
                </motion.span>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="progress-text">
                <span>Word {currentWordIndex + 1} of {words.length}</span>
                <span>{progressPercentage.toFixed(1)}% complete</span>
              </div>
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="input-container"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isFinished ? "Press Enter to restart" : "Start typing here..."}
              className="typing-input"
              disabled={isFinished && time === 0}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            />
            
            {/* Current Word Preview */}
            {words[currentWordIndex] && (
              <motion.div 
                className="current-word-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="preview-label">Current word:</div>
                <div className="preview-word">{words[currentWordIndex]}</div>
              </motion.div>
            )}
            
            <AnimatePresence>
              {isFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="results-overlay"
                >
                  <div className="results-content">
                    <Sparkles className="sparkle-icon" />
                    <h3>Test Complete!</h3>
                    <div className="final-stats">
                      <div className="final-stat">
                        <span className="final-label">Final WPM:</span>
                        <span className="final-value" style={{ color: getWPMColor() }}>
                          {wpm}
                        </span>
                      </div>
                      <div className="final-stat">
                        <span className="final-label">Accuracy:</span>
                        <span className="final-value" style={{ color: getAccuracyColor() }}>
                          {accuracy}%
                        </span>
                      </div>
                      <div className="final-stat">
                        <span className="final-label">Words Typed:</span>
                        <span className="final-value" style={{ color: '#6366f1' }}>
                          {typedWords}
                        </span>
                      </div>
                    </div>
                    <p className="restart-hint">Press Enter or click restart to try again</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Controls */}
          <div className="controls">
            <motion.button
              onClick={resetTest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="control-btn restart-btn"
            >
              <RefreshCw className="btn-icon" />
              Restart Test
            </motion.button>
            
            <div className="instructions">
              <p>Type each word and press Space to continue</p>
              <div className="hints">
                <div className="hint">
                  <div className="hint-color completed"></div>
                  <span>Completed</span>
                </div>
                <div className="hint">
                  <div className="hint-color current"></div>
                  <span>Current</span>
                </div>
                <div className="hint">
                  <div className="hint-color upcoming"></div>
                  <span>Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="footer"
        >
          <p>Type each word and press Space • Copy and paste are allowed • Focus on speed!</p>
          <p className="footer-tip">Tip: The words are not selectable - focus on typing!</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
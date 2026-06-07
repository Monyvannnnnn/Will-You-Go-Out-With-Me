import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Coffee, 
  Film, 
  Soup, 
  Trees, 
  ArrowRight, 
  Check,
  Sparkles
} from "lucide-react";

export default function App() {
  const [step, setStep] = useState(0); // 0: Envelope, 1: Question, 2: Date, 3: Place, 4: Yay!
  const [selectedDate, setSelectedDate] = useState("");
  const [place, setPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Interactive "No" button state
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0, absolute: false });
  const [dateError, setDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background floating hearts
  const [hearts, setHearts] = useState([]);
  
  // Confetti particles for success screen
  const [confetti, setConfetti] = useState([]);

  // Envelope state
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  useEffect(() => {
    // Generate random background floating hearts
    const initialHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6, // scale multiplier
      delay: Math.random() * 12, // staggered start
      duration: Math.random() * 6 + 6, // speed (6s to 12s)
      opacity: Math.random() * 0.4 + 0.2, // soft transparency
    }));
    setHearts(initialHearts);
  }, []);

  useEffect(() => {
    // Generate confetti and play success audio when step is 4 (Yay!)
    if (step === 4) {
      playSound('success');
      const newConfetti = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 12 + 6, // px size
        delay: Math.random() * 3, // staggered delay
        duration: Math.random() * 4 + 3, // falling duration (3s to 7s)
        color: [
          '#ff4d6d', '#ff758f', '#ff85a1', '#ffb3c1', // pinks
          '#f72585', '#b5179e', '#7209b7', // purples
          '#ffd166', '#06d6a0', '#118ab2'  // accent colors
        ][Math.floor(Math.random() * 10)],
        rotation: Math.random() * 360,
        swayDelay: Math.random() * 2,
        isHeart: Math.random() > 0.5,
      }));
      setConfetti(newConfetti);
    }
  }, [step]);

  // Synthesize sound effects using Web Audio API (completely client-side & reliable)
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        // Soft bubble-like click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'no') {
        // Whimsical descending slide
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'yes') {
        // Uplifting double bell
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'success') {
        // Beautiful romantic arpeggio chord
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major
        notes.forEach((freq, index) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + index * 0.08);
          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.06, now + index * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);
          
          noteOsc.start(now + index * 0.08);
          noteOsc.stop(now + index * 0.08 + 0.45);
        });
      }
    } catch (e) {
      console.warn("AudioContext block: standard browser gesture security.", e);
    }
  };

  // Triggered when Dane clicks envelope to open it
  const handleOpenEnvelope = () => {
    playSound('click');
    setEnvelopeOpen(true);
    // Transition to step 1 after envelope opens (1.4 seconds)
    setTimeout(() => {
      setStep(1);
    }, 1400);
  };

  // Playful "No" button text responses
  const noTexts = [
    "No 😢",
    "Are you sure? 💔",
    "Think again... 🥺",
    "Pretty please? 💕",
    "You're breaking my heart... 😭",
    "What if I buy you flowers? 🌸",
    "How about cookies? 🍪",
    "I'll be super cute! 🧸",
    "No is disabled! 😉",
    "Just say YES! ❤️"
  ];

  // Move the "No" button dynamically and make the "Yes" button grow
  const handleNoButtonTrigger = (e) => {
    e.preventDefault(); // Stop click events on mobile from triggering standard behavior
    moveNoButton();
  };

  const moveNoButton = () => {
    playSound('no');
    setNoCount(prev => prev + 1);

    // Calculate a random absolute position on screen
    const buttonPadding = 80;
    const maxX = window.innerWidth - buttonPadding * 2;
    const maxY = window.innerHeight - buttonPadding * 2;
    
    const randomX = Math.max(buttonPadding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(buttonPadding, Math.floor(Math.random() * maxY));

    setNoPosition({
      x: randomX,
      y: randomY,
      absolute: true
    });
  };

  // Click handler for standard step transitions
  const handleNextStep = (next) => {
    playSound('click');
    setStep(next);
  };

  // Date selection validation and continuation
  const handleDateContinue = () => {
    if (!selectedDate) {
      playSound('no');
      setDateError(true);
      setTimeout(() => setDateError(false), 800); // Shaking animation duration
      return;
    }
    playSound('click');
    setStep(3);
  };

  // Choose a place and select it
  const handlePlaceSelect = (selectedPlace) => {
    playSound('click');
    setPlace(selectedPlace);
  };

  // Places with icons, subtitles, and standard key tags matching the user's template
  const placesList = [
    { name: "Cafe", icon: Coffee, subtitle: "Cozy café, warm drinks & sweet pastries" },
    { name: "Movie", icon: Film, subtitle: "Giant screen, popcorn & holding hands" },
    { name: "HotPot", icon: Soup, subtitle: "Delicious food & romantic ambience" },
    { name: "Koh Norea", icon: Trees, subtitle: "A scenic walk, fresh breeze & cute picnic" },
    { name: "Other", icon: Sparkles, subtitle: "Choose your own custom romantic place! ✨" }
  ];

  // Send RSVP selections to Supabase database table 'date_responses'
  const submitResponse = async () => {
    const finalPlace = place === "Other" ? customPlace.trim() : place;
    if (!finalPlace) {
      playSound('no');
      alert(place === "Other" ? "Please suggest where you want us to go! 💝" : "Please choose a romantic place for us!");
      return;
    }
    
    setIsSubmitting(true);
    playSound('click');

    try {
      const { error } = await supabase
        .from('date_responses')
        .insert([
          {
            girlfriend_name: "Dane",
            selected_date: selectedDate,
            selected_place: finalPlace,
            answer: "YES ❤️"
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setStep(4);
    } catch (error) {
      console.error("Database error:", error);
      alert("Oops! Failed to save your response to the database. Please try again! ❤️");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic style for Yes button scale
  const yesButtonScale = 1 + noCount * 0.18;
  const noButtonLabel = noTexts[Math.min(noCount, noTexts.length - 1)];

  return (
    <div className="app-container">
      {/* Background Floating Hearts */}
      <div className="hearts-background">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="floating-heart"
            style={{
              left: `${h.left}%`,
              opacity: h.opacity,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              transform: `scale(${h.size})`,
              '--size': h.size,
              '--opacity': h.opacity
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Confetti Particles (rendered only on Yay screen) */}
      {step === 4 && (
        <div className="confetti-container">
          {confetti.map((c) => (
            <div
              key={c.id}
              className={`confetti-particle ${c.isHeart ? 'confetti-heart' : ''}`}
              style={{
                left: `${c.left}%`,
                backgroundColor: c.isHeart ? 'transparent' : c.color,
                color: c.isHeart ? c.color : 'transparent',
                width: `${c.size}px`,
                height: `${c.size}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotation}deg)`,
                '--sway-delay': `${c.swayDelay}s`,
              }}
            >
              {c.isHeart ? '❤️' : ''}
            </div>
          ))}
        </div>
      )}

      {/* Main Container Card */}
      <div className={`card-wrapper step-${step}`}>
        
        {/* STEP 0: The Interactive Envelope */}
        {step === 0 && (
          <div className="envelope-container">
            <h1 className="envelope-title">Dane, a letter for you...</h1>
            <div 
              id="envelope-interactive"
              className={`envelope ${envelopeOpen ? 'open' : ''}`}
              onClick={handleOpenEnvelope}
            >
              <div className="envelope-flap"></div>
              <div className="envelope-paper">
                <div className="paper-text">
                  <p>Dearest Dane,</p>
                  <p className="paper-highlight">I have a question...</p>
                </div>
              </div>
              <div className="envelope-body"></div>
              <div className="wax-seal">
                <Heart size={20} className="seal-heart-icon" fill="white" color="white" />
              </div>
            </div>
            <p className="envelope-tip">Click the envelope to open</p>
          </div>
        )}

        {/* STEP 1: The Romantic Ask */}
        {step === 1 && (
          <div className="ask-card">
            <div className="ask-emoji">
              <Heart size={64} className="header-icon-heart" fill="var(--primary)" color="var(--primary)" />
            </div>
            <h1 className="ask-title">Hi Dane ❤️</h1>
            <p className="ask-subtitle">Will you go on a date with me?</p>
            
            <div className="ask-buttons-container">
              <button
                id="btn-yes-date"
                onClick={() => {
                  playSound('yes');
                  handleNextStep(2);
                }}
                style={{ transform: `scale(${yesButtonScale})` }}
                className="btn-yes animate-pulse"
              >
                Yes <Heart size={18} className="inline-icon" fill="white" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
              </button>

              <button
                id="btn-no-date"
                onMouseEnter={moveNoButton}
                onTouchStart={handleNoButtonTrigger}
                onClick={handleNoButtonTrigger}
                style={
                  noPosition.absolute
                    ? {
                        position: 'fixed',
                        left: `${noPosition.x}px`,
                        top: `${noPosition.y}px`,
                        zIndex: 1000,
                        transition: 'left 0.15s ease-out, top 0.15s ease-out'
                      }
                    : {}
                }
                className="btn-no"
              >
                {noButtonLabel}
              </button>
            </div>

            {noCount > 0 && (
              <p className="playful-hint">
                {noCount >= 7 ? "Resistance is futile! 😘" : "Hovering/clicking No only makes my love grow! 📈"}
              </p>
            )}
          </div>
        )}

        {/* STEP 2: The Date Picker */}
        {step === 2 && (
          <div className="date-card">
            <div className="card-header-icon">
              <Calendar size={48} className="header-icon" />
            </div>
            <h2 className="section-title">Pick a perfect date</h2>
            <p className="section-desc">Select a day on the calendar when you are free to hang out: </p>
            
            <div className={`date-input-container ${dateError ? 'shake-animation' : ''}`}>
              <input
                id="date-picker-input"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateError(false);
                }}
                className="custom-date-picker"
                min={new Date().toISOString().split('T')[0]} // Can't pick past dates
              />
            </div>
            
            {dateError && (
              <p className="error-text">Please pick a date for our special day! ✨</p>
            )}

            <button
              id="btn-date-continue"
              onClick={handleDateContinue}
              className="btn-continue"
            >
              Continue <ArrowRight size={18} className="inline-icon" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>
          </div>
        )}

        {/* STEP 3: The Place Picker */}
        {step === 3 && (
          <div className="place-card">
            <div className="card-header-icon">
              <MapPin size={48} className="header-icon" />
            </div>
            <h2 className="section-title">Choose a dreamy place</h2>
            <p className="section-desc">Select where you would love to spend our time together:</p>

            <div className="places-grid">
              {placesList.map((item) => {
                const isSelected = place === item.name;
                const baseName = item.name.toLowerCase();
                return (
                  <div
                    id={`place-card-${baseName}`}
                    key={item.name}
                    className={`place-grid-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePlaceSelect(item.name)}
                  >
                    <div className="place-icon-container">
                      <item.icon className="place-icon" size={24} />
                    </div>
                    <div className="place-info">
                      <h3 className="place-name">{item.name}</h3>
                      <p className="place-desc">{item.subtitle}</p>
                    </div>
                    {isSelected && (
                      <div className="checkmark-badge">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {place === "Other" && (
              <div className="custom-place-input-container">
                <label htmlFor="custom-place-input" className="custom-place-label">
                  Where would you like to go instead? 💝
                </label>
                <input
                  id="custom-place-input"
                  type="text"
                  placeholder="e.g. My favorite restaurant, a sunset walk..."
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  className="custom-place-input"
                  maxLength={100}
                />
              </div>
            )}

            <button
              id="btn-place-submit"
              onClick={submitResponse}
              disabled={isSubmitting || !place || (place === "Other" && !customPlace.trim())}
              className="btn-submit"
            >
              {isSubmitting ? (
                <div className="submitting-spinner">
                  <Heart className="spinner-heart" size={18} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Sending...
                </div>
              ) : (
                <>
                  Lock it in! <Heart size={18} className="inline-icon" fill="white" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div className="yay-card">
            <div className="yay-sparkles">🎈 ✨ 🎉</div>
            <h1 className="yay-title animate-bounce">Yay! ❤️</h1>
            <div className="cute-illustration">
              <span className="illust-emoji left">👩‍❤️‍👨</span>
            </div>
            <h2 className="yay-heading">It's officially a date, Dane!</h2>
            <p className="yay-text">
              I've sent our selections over. Mark your calendar for <strong className="highlight-date">{selectedDate}</strong> at the <strong className="highlight-place">{place === "Other" ? customPlace : place}</strong>.
            </p>
            <p className="yay-footer">Can't wait to make beautiful memories with you! 💕</p>
          </div>
        )}

      </div>
    </div>
  );
}

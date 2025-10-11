import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

const HeritageStoryBook = () => {
  const { name } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Optional story chapters loaded from public/chapters
  const [storyChapters, setStoryChapters] = useState(null);
 
  // Audio + narration state
  const audioRef = useRef(null);
  const [displayedText, setDisplayedText] = useState('');
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(-1);
  const [typingTick, setTypingTick] = useState(0); // forces re-render during typewriter
  const [audioOverlayVisible, setAudioOverlayVisible] = useState(false);

  // Ken Burns state for left image
  const [kenBurnsScale, setKenBurnsScale] = useState(1);
  const [kenBurnsTranslate, setKenBurnsTranslate] = useState({ x: 0, y: 0 });

  // Flip animation direction
  const [flipDirection, setFlipDirection] = useState('next');

  // Fetch heritage site data
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/heritage/${encodeURIComponent(name)}`);
        
        if (!response.ok) {
          throw new Error('Site not found');
        }
        
        const data = await response.json();
        setSite(data);
        setLoading(false);
      } catch (err) {
        setError('Could not load site information.');
        setLoading(false);
      }
    };

    if (name) {
      fetchSiteData();
    }
  }, [name]);

  // Try to fetch optional chapters JSON from public/chapters
  useEffect(() => {
    let cancelled = false;
    const loadChapters = async () => {
      if (!name) return;
      const tryPaths = [
        `/chapters/${name}.json`,
        `/chapters/${name.replace(/\s+/g, '-').toLowerCase()}.json`
      ];
      for (const path of tryPaths) {
        try {
          const res = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            if (!cancelled) setStoryChapters(Array.isArray(json) ? json : json?.chapters || null);
            break;
          }
        } catch (_) {
          // continue
        }
      }
    };
    loadChapters();
    return () => { cancelled = true; };
  }, [name]);

  // Generate fallback story chapters from site data
  const generateChapters = (siteData) => {
    const chapters = [];
    
    // Chapter 1: Introduction
    if (siteData.info?.full) {
      chapters.push({
        title: "Chapter 1: Introduction",
        image: siteData.media?.panorama_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        text: siteData.info.full,
        type: 'introduction'
      });
    }

    // Chapter 2: History
    if (siteData.info?.history) {
      chapters.push({
        title: "Chapter 2: History",
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        text: siteData.info.history,
        type: 'history'
      });
    }

    // Chapter 3: Architecture
    if (siteData.info?.architecture) {
      chapters.push({
        title: "Chapter 3: Architecture",
        image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800&h=600&fit=crop',
        text: siteData.info.architecture,
        type: 'architecture'
      });
    }

    // Chapter 4: Significance
    if (siteData.info?.significance) {
      chapters.push({
        title: "Chapter 4: Significance",
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop',
        text: siteData.info.significance,
        type: 'significance'
      });
    }

    // Chapter 5: Visiting Tips
    if (siteData.info?.visitingTips && siteData.info.visitingTips.length > 0) {
      chapters.push({
        title: "Chapter 5: Visiting Tips",
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        text: siteData.info.visitingTips.join('\n\n• '),
        type: 'tips'
      });
    }

    return chapters;
  };

    // Final chapters: prefer storyChapters if present, else fallback
  const chapters = useMemo(() => {
    if (storyChapters && storyChapters.length > 0) return storyChapters;
    if (site) return generateChapters(site);
    return [];
  }, [storyChapters, site]);  const stopAudio = () => {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (_) {}
      audioRef.current.src = '';
      audioRef.current.load?.();
    }
  };

  const resetNarration = () => {
    setDisplayedText('');
    setActiveCaptionIndex(-1);
    setTypingTick((t) => t + 1);
  };

  // Flip sound
  const pageTurnAudioRef = useRef(null);
  useEffect(() => {
    if (!pageTurnAudioRef.current) {
      pageTurnAudioRef.current = new window.Audio('/audio/pageturn-audio.wav');
    }
  }, []);

  const handlePageFlip = (direction) => {
    if (isFlipping) return;
    setFlipDirection(direction);
    // Play flip sound
    if (pageTurnAudioRef.current) {
      try {
        pageTurnAudioRef.current.currentTime = 0;
        pageTurnAudioRef.current.play();
      } catch (e) {}
    }
    setIsFlipping(true);
    setTimeout(() => {
      if (direction === 'next') {
        if (currentPage <= chapters.length) {
          setCurrentPage(prev => prev + 1);
        }
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
      setIsFlipping(false);
    }, 600); // slightly longer for visible animation
  };

  const handleClose = () => {
    window.history.back();
  };

  const isLastPage = currentPage === chapters.length + 1;

  // Setup audio + narration on page change
  useEffect(() => {
    // Cover page or closing page: stop audio and reset
    if (currentPage === 0 || isLastPage) {
      stopAudio();
      resetNarration();
      return;
    }
    


    const chapter = chapters[currentPage - 1];
    if (!chapter) return;
    resetNarration();

    // Ken Burns animate
    const kb = chapter?.image?.kenBurns;
    const beginScale = (kb?.enabled && kb?.zoomStart) ? kb.zoomStart : 1;
    const endScale = (kb?.enabled && kb?.zoomEnd) ? kb.zoomEnd : beginScale;
    setKenBurnsScale(beginScale);
    setKenBurnsTranslate({ x: 0, y: 0 });
    const kbTimer = setTimeout(() => {
      setKenBurnsScale(endScale);
      // Optional pan support in future via translate
    }, 50);

    // If audio provided
    const audioUrl = chapter?.audio?.url;
    const captions = chapter?.audio?.captions;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setAudioOverlayVisible(false);

      const onTimeUpdate = () => {
        const tMs = audio.currentTime * 1000;
        if (Array.isArray(captions) && captions.length > 0) {
          const idx = captions.findIndex(c => tMs >= c.startMs && tMs < c.endMs);
          setActiveCaptionIndex(idx);
          if (idx >= 0) {
            const c = captions[idx];
            const span = Math.max(1, c.endMs - c.startMs);
            const within = Math.max(0, Math.min(span, tMs - c.startMs));
            const progress = within / span;
            const chars = Math.max(0, Math.floor(c.text.length * progress));
            setDisplayedText(c.text.slice(0, chars));
          } else {
            setDisplayedText('');
          }
        } else {
          // No captions: simple typewriter over full text at ~30 chars/sec
          const body = chapter?.text || '';
          const cps = 30;
          const chars = Math.min(body.length, Math.floor((audio.currentTime) * cps));
          setDisplayedText(body.slice(0, chars));
        }
      };

      const onEnded = () => {
        // Ensure full last caption text when ended
        if (Array.isArray(captions) && captions.length > 0) {
          setDisplayedText(captions[captions.length - 1].text);
        }
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
      audio.play().catch(() => {
        // Autoplay blocked – show overlay to request user gesture
        setAudioOverlayVisible(true);
      });

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
        try { audio.pause(); } catch (_) {}
      };
    } else {
      // No audio: typewriter using interval
      const body = chapter?.text || '';
      setDisplayedText('');
      let i = 0;
      const cps = 30; // chars per second
      const interval = setInterval(() => {
        i = Math.min(body.length, i + 2);
        setDisplayedText(body.slice(0, i));
        if (i >= body.length) clearInterval(interval);
      }, 1000 / cps);
      return () => clearInterval(interval);
    }
  }, [currentPage, isLastPage, chapters]);

  // From here on, render based on state using conditional blocks inside one return
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#2c1810',
      fontFamily: "'Merriweather', serif",
      overflow: 'hidden'
    }}>
      {/* Loading state */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d4af37'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
            <div style={{ fontSize: '24px' }}>Opening the story...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && (error || !site) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d4af37'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
            <div style={{ fontSize: '24px', marginBottom: '20px' }}>Story Not Found</div>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#d4af37',
                color: '#2c1810',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Back to Map
            </button>
          </div>
        </div>
      )}

      {/* No chapters guard */}
      {!loading && !error && site && (!chapters || chapters.length === 0) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f4e4bc'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 720, padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 22, marginBottom: 8 }}>No story chapters available</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              Ensure your chapters JSON exists at /chapters/{name}.json or /chapters/{name.replace(/\s+/g, '-').toLowerCase()}.json
            </div>
          </div>
        </div>
      )}
      {/* Book Cover */}
      {!loading && site && currentPage === 0 && (
        <div style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(rgba(44, 24, 16, 0.7), rgba(44, 24, 16, 0.7)), url(${site?.media?.panorama_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Decorative border */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '3px solid #d4af37',
            borderRadius: '20px',
            pointerEvents: 'none'
          }} />
          
          {/* Book title */}
          <div style={{
            backgroundColor: 'rgba(44, 24, 16, 0.9)',
            padding: '40px 60px',
            borderRadius: '15px',
            border: '2px solid #d4af37',
            marginBottom: '40px',
            maxWidth: '600px'
          }}>
            <h1 style={{
              fontSize: '48px',
              color: '#d4af37',
              margin: '0 0 20px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontWeight: 'bold'
            }}>
              {site?.name || ''}
            </h1>
            <p style={{
              fontSize: '24px',
              color: '#f4e4bc',
              margin: '0 0 10px 0',
              fontStyle: 'italic'
            }}>
              {site?.category || ''}
            </p>
            <p style={{
              fontSize: '18px',
              color: '#d4af37',
              margin: '0'
            }}>
              {site?.year || ''}
            </p>
          </div>

          {/* Open book button */}
          <button
            onClick={() => handlePageFlip('next')}
            style={{
              padding: '20px 40px',
              backgroundColor: '#d4af37',
              color: '#2c1810',
              border: 'none',
              borderRadius: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              fontFamily: "'Merriweather', serif",
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 25px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
          >
            📖 Open Book
          </button>
        </div>
      )}

      {/* Chapter Pages */}
      {currentPage > 0 && currentPage <= chapters.length && (
        <div className={`book${isFlipping ? ' flip' : ''} ${flipDirection}`} style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          perspective: '2000px',
          display: 'flex',
        }}>
          {/* Left Page - Image */}
          {(() => {
            const ch = chapters[currentPage - 1];
            const img = ch?.image || {};
            const bgPos = img?.focalPoint ? `${img.focalPoint.x * 100}% ${img.focalPoint.y * 100}%` : 'center';
            const bgSize = img?.fit === 'contain' ? 'contain' : 'cover';
            const kbEnabled = img?.kenBurns?.enabled;
            return (
              <div className="book-page left" style={{
                width: '50%',
                height: '100%',
                position: 'relative',
                borderRight: '2px solid #d4af37',
                overflow: 'hidden',
                transformStyle: 'preserve-3d',
                background: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img?.url || ch?.image || ''})`,
                  backgroundSize: bgSize,
                  backgroundPosition: bgPos,
                  backgroundRepeat: 'no-repeat',
                  transform: `scale(${kenBurnsScale}) translate(${kenBurnsTranslate.x}px, ${kenBurnsTranslate.y}px)`,
                  transition: kbEnabled ? `transform ${(img?.kenBurns?.durationMs || 10000)}ms ease-in-out` : 'none'
                }} />
                {/* Image overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(44, 24, 16, 0.25), rgba(44, 24, 16, 0.1))'
                }} />
                {/* Caption */}
                {img?.caption && (
                  <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    color: '#f4e4bc',
                    fontSize: '14px',
                    textShadow: '0 2px 6px rgba(0,0,0,0.6)'
                  }}>
                    {img.caption}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Right Page - Text */}
          <div className="book-page right" style={{
            width: '50%',
            height: '100%',
            backgroundColor: '#f4e4bc',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23d4af37\\" fill-opacity=\\"0.05\\"%3E%3Ccircle cx=\\"30\\" cy=\\"30\\" r=\\"2\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            transformStyle: 'preserve-3d',
          }}>
            {/* Page number */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              color: '#8b7355',
              fontSize: '14px'
            }}>
              {currentPage} / {chapters.length + 1}
            </div>

            {/* Chapter title */}
            <h2 style={{
              fontSize: '36px',
              color: '#2c1810',
              margin: '0 0 30px 0',
              fontWeight: 'bold',
              borderBottom: '3px solid #d4af37',
              paddingBottom: '15px'
            }}>
              {chapters[currentPage - 1].title}
            </h2>

            {/* Centered typewriter text area */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
              <div style={{
                maxWidth: 720,
                width: '100%',
                textAlign: 'center',
                fontSize: '40px',
                fontStyle: 'italic',
                lineHeight: 1.8,
                color: '#2c1810',
                padding: '10px 6px',
                position: 'relative'
              }}>
                <span>{displayedText}</span>
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  marginLeft: 2,
                  backgroundColor: 'transparent',
                  borderLeft: '3px solid #d4af37',
                  animation: 'blink 1s step-start 0s infinite'
                }} />
              </div>
            </div>

            {/* Inline keyframes for blinking caret */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes blink { 50% { opacity: 0; } }
            `}} />
          </div>
          {/* Flip animation CSS */}
          <style>{`
            .book {
              transition: transform 0.6s cubic-bezier(0.4,0.2,0.2,1);
              transform-style: preserve-3d;
            }
            .book.flip.next {
              transform: rotateY(-180deg);
            }
            .book.flip.prev {
              transform: rotateY(180deg);
            }
            .book-page {
              backface-visibility: hidden;
            }
            .book-page.left {
              z-index: 2;
            }
            .book-page.right {
              z-index: 1;
            }
          `}</style>
        </div>
      )}

      {/* Closing Page */}
      {!loading && site && isLastPage && (
        <div style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(rgba(44, 24, 16, 0.8), rgba(44, 24, 16, 0.8)), url(${site?.media?.panorama_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Decorative border */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '3px solid #d4af37',
            borderRadius: '20px',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            backgroundColor: 'rgba(44, 24, 16, 0.9)',
            padding: '40px 60px',
            borderRadius: '15px',
            border: '2px solid #d4af37',
            maxWidth: '600px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
            <h2 style={{
              fontSize: '36px',
              color: '#d4af37',
              margin: '0 0 20px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Journey Complete
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#f4e4bc',
              margin: '0 0 30px 0',
              lineHeight: '1.6'
            }}>
              You've completed the journey through <strong>{site?.name || ''}</strong>. 
              We hope this story has inspired you to visit and experience the rich heritage of this remarkable place.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentPage(0)}
                style={{
                  padding: '15px 30px',
                  backgroundColor: 'transparent',
                  color: '#d4af37',
                  border: '2px solid #d4af37',
                  borderRadius: '25px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontFamily: "'Merriweather', serif",
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d4af37';
                  e.target.style.color = '#2c1810';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d4af37';
                }}
              >
                📖 Read Again
              </button>
              
              <button
                onClick={handleClose}
                style={{
                  padding: '15px 30px',
                  backgroundColor: '#d4af37',
                  color: '#2c1810',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontFamily: "'Merriweather', serif",
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📍 Back to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio gesture overlay */}
      {audioOverlayVisible && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', zIndex: 5
        }}>
          <div style={{
            background: '#fff', padding: '18px 22px', borderRadius: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>Tap to enable narration</div>
            <button onClick={() => {
              setAudioOverlayVisible(false);
              const a = audioRef.current;
              if (a) a.play().catch(()=>{});
            }}
            style={{
              padding: '10px 16px', background: '#d4af37', color: '#2c1810',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700
            }}>▶ Play</button>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      {currentPage > 0 && !isLastPage && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => handlePageFlip('prev')}
            disabled={currentPage === 1 || isFlipping}
            style={{
              padding: '12px 20px',
              backgroundColor: currentPage === 1 ? '#666' : '#d4af37',
              color: currentPage === 1 ? '#999' : '#2c1810',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontFamily: "'Merriweather', serif",
              fontWeight: 'bold',
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            ◀ Previous
          </button>
          
          <span style={{
            color: '#d4af37',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {currentPage} / {chapters.length + 1}
          </span>
          
          <button
            onClick={() => handlePageFlip('next')}
            disabled={isFlipping}
            style={{
              padding: '12px 20px',
              backgroundColor: '#d4af37',
              color: '#2c1810',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: "'Merriweather', serif",
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Close button (X) */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          backgroundColor: 'rgba(44, 24, 16, 0.8)',
          color: '#d4af37',
          border: '2px solid #d4af37',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#d4af37';
          e.target.style.color = '#2c1810';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(44, 24, 16, 0.8)';
          e.target.style.color = '#d4af37';
        }}
      >
        ×
      </button>
    </div>
  );
};

export default HeritageStoryBook;
 
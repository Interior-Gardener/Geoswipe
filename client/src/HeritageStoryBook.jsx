import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';
import { fetchMonumentImage, primeMonumentImageCache } from './utils/heritageImageService';
import './styles/storybook-reader.css';

/** Used only when a site has no imagery of its own to illustrate a chapter. */
const GENERIC_COVER =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop';

/** Characters per second for the narration typewriter. */
const TYPE_CPS = 45;

const HeritageStoryBook = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [dynamicImage, setDynamicImage] = useState(null);

  // Optional story chapters loaded from public/chapters
  const [storyChapters, setStoryChapters] = useState(null);

  // Audio + narration state
  const audioRef = useRef(null);
  const typingRef = useRef(null);
  const skipRef = useRef(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [audioOverlayVisible, setAudioOverlayVisible] = useState(false);

  // Ken Burns state for the illustration
  const [kenBurnsScale, setKenBurnsScale] = useState(1);

  // Page-turn direction, used to bias the turn animation.
  const [flipDirection, setFlipDirection] = useState('next');

  const currentSelection =
    normalizeMonumentSelection(site) ||
    extractMonumentFromRouteState(location.state) ||
    selectedMonument;

  // Fetch heritage site data
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/heritage/${encodeURIComponent(name)}`
        );

        if (!response.ok) {
          throw new Error('Site not found');
        }

        const data = await response.json();
        setSite(data);
        setLoading(false);
      } catch (_err) {
        setError('Could not load site information.');
        setLoading(false);
      }
    };

    if (name) {
      fetchSiteData();
    }
  }, [name]);

  useEffect(() => {
    let active = true;

    if (!site?.name) {
      setDynamicImage(null);
      return () => {
        active = false;
      };
    }

    const localFallback = site?.monumentImage?.imageUrl
      ? site.monumentImage
      : site?.media?.panorama_url
      ? { imageUrl: site.media.panorama_url, source: 'fallback' }
      : null;

    if (localFallback?.imageUrl) {
      setDynamicImage(localFallback);
      primeMonumentImageCache(site.name, localFallback);
    }

    fetchMonumentImage(site.name)
      .then((resolvedImage) => {
        if (!active || !resolvedImage?.imageUrl) {
          return;
        }

        setDynamicImage(resolvedImage);
        primeMonumentImageCache(site.name, resolvedImage);
      })
      .catch(() => {
        // Keep fallback image for storytelling visuals.
      });

    return () => {
      active = false;
    };
  }, [site]);

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
        } catch (_e) {
          // continue
        }
      }
    };
    loadChapters();
    return () => { cancelled = true; };
  }, [name]);

  // Story assembled from the site's own record when there is no hand-authored
  // chapter file. Every chapter is illustrated with the monument's own image -
  // the previous build pulled unrelated stock photography for chapters 2-5.
  const chapters = useMemo(() => {
    if (storyChapters && storyChapters.length > 0) return storyChapters;
    if (!site) return [];

    const cover = dynamicImage?.imageUrl || site.media?.panorama_url || GENERIC_COVER;
    const info = site.info || {};
    const built = [];

    const push = (title, text, type) => {
      if (!text) return;
      built.push({ title, text, type, image: cover });
    };

    push('Introduction', info.full, 'introduction');
    push('History', info.history, 'history');
    push('Architecture', info.architecture, 'architecture');
    push('Significance', info.significance, 'significance');

    if (Array.isArray(info.visitingTips) && info.visitingTips.length > 0) {
      // Note the leading bullet: joining alone left the first tip unmarked.
      push('Visiting Tips', `• ${info.visitingTips.join('\n\n• ')}`, 'tips');
    }

    return built;
  }, [storyChapters, site, dynamicImage]);

  const totalChapters = chapters.length;
  const isCover = currentPage === 0;
  const isLastPage = totalChapters > 0 && currentPage === totalChapters + 1;
  const isChapter = currentPage > 0 && currentPage <= totalChapters;
  const chapter = isChapter ? chapters[currentPage - 1] : null;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (_e) { /* already detached */ }
      audioRef.current.src = '';
      audioRef.current.load?.();
      audioRef.current = null;
    }
  }, []);

  // Page-turn sound
  const pageTurnAudioRef = useRef(null);
  useEffect(() => {
    if (!pageTurnAudioRef.current) {
      pageTurnAudioRef.current = new window.Audio('/audio/pageturn-audio.wav');
    }
  }, []);

  const goToPage = useCallback((target, direction) => {
    if (isFlipping) return;
    if (target < 0 || target > totalChapters + 1) return;

    setFlipDirection(direction);

    if (pageTurnAudioRef.current) {
      try {
        pageTurnAudioRef.current.currentTime = 0;
        pageTurnAudioRef.current.play();
      } catch { /* non-critical */ }
    }

    setIsFlipping(true);
    setCurrentPage(target);
    window.setTimeout(() => setIsFlipping(false), 460);
  }, [isFlipping, totalChapters]);

  const handlePageFlip = useCallback((direction) => {
    goToPage(
      direction === 'next' ? currentPage + 1 : currentPage - 1,
      direction
    );
  }, [goToPage, currentPage]);

  const handleClose = useCallback(() => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  }, [currentSelection, navigate]);

  /** Reveal the rest of the chapter immediately rather than waiting it out. */
  const skipTyping = useCallback(() => {
    skipRef.current = true;
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setDisplayedText(chapter?.text || '');
    setTypingDone(true);
  }, [chapter]);

  // Narration for the current chapter: audio with captions when the chapter
  // ships them, otherwise a plain typewriter over the chapter text.
  useEffect(() => {
    skipRef.current = false;
    setTypingDone(false);
    setDisplayedText('');

    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }

    if (!isChapter || !chapter) {
      stopAudio();
      setAudioOverlayVisible(false);
      return undefined;
    }

    // Ken Burns
    const kb = chapter?.image?.kenBurns;
    const beginScale = (kb?.enabled && kb?.zoomStart) ? kb.zoomStart : 1;
    const endScale = (kb?.enabled && kb?.zoomEnd) ? kb.zoomEnd : beginScale;
    setKenBurnsScale(beginScale);
    const kbTimer = window.setTimeout(() => setKenBurnsScale(endScale), 50);

    const audioUrl = chapter?.audio?.url;
    const captions = chapter?.audio?.captions;
    const body = chapter?.text || '';

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setAudioOverlayVisible(false);

      const onTimeUpdate = () => {
        if (skipRef.current) return;
        const tMs = audio.currentTime * 1000;
        if (Array.isArray(captions) && captions.length > 0) {
          const idx = captions.findIndex((c) => tMs >= c.startMs && tMs < c.endMs);
          if (idx >= 0) {
            const c = captions[idx];
            const span = Math.max(1, c.endMs - c.startMs);
            const within = Math.max(0, Math.min(span, tMs - c.startMs));
            const chars = Math.max(0, Math.floor(c.text.length * (within / span)));
            setDisplayedText(c.text.slice(0, chars));
          } else {
            setDisplayedText('');
          }
        } else {
          const chars = Math.min(body.length, Math.floor(audio.currentTime * TYPE_CPS));
          setDisplayedText(body.slice(0, chars));
        }
      };

      const onEnded = () => {
        if (Array.isArray(captions) && captions.length > 0) {
          setDisplayedText(captions[captions.length - 1].text);
        } else {
          setDisplayedText(body);
        }
        setTypingDone(true);
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
      audio.play().catch(() => {
        // Autoplay blocked - ask for a gesture rather than sitting silent.
        setAudioOverlayVisible(true);
      });

      return () => {
        window.clearTimeout(kbTimer);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
        try { audio.pause(); } catch (_e) { /* already detached */ }
      };
    }

    // No audio: typewriter.
    let i = 0;
    typingRef.current = window.setInterval(() => {
      i = Math.min(body.length, i + 2);
      setDisplayedText(body.slice(0, i));
      if (i >= body.length) {
        clearInterval(typingRef.current);
        typingRef.current = null;
        setTypingDone(true);
      }
    }, 2000 / TYPE_CPS);

    return () => {
      window.clearTimeout(kbTimer);
      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
    };
  }, [currentPage, isChapter, chapter, stopAudio]);

  // Stop narration when the reader unmounts.
  useEffect(() => () => {
    stopAudio();
    if (typingRef.current) clearInterval(typingRef.current);
  }, [stopAudio]);

  // Keyboard paging. The Story Library tells readers these keys work, so they
  // have to actually work.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          if (currentPage <= totalChapters) handlePageFlip('next');
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          if (currentPage > 0) handlePageFlip('prev');
          break;
        case ' ':
          event.preventDefault();
          // Space finishes the narration first, then advances.
          if (isChapter && !typingDone) skipTyping();
          else if (currentPage <= totalChapters) handlePageFlip('next');
          break;
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPage, totalChapters, isChapter, typingDone, handlePageFlip, handleClose, skipTyping]);

  const coverImage =
    dynamicImage?.imageUrl || site?.media?.panorama_url || GENERIC_COVER;

  const progress = useMemo(() => {
    if (totalChapters === 0) return 0;
    return Math.min(100, (currentPage / (totalChapters + 1)) * 100);
  }, [currentPage, totalChapters]);

  const slug = name ? name.replace(/\s+/g, '-').toLowerCase() : '';

  // Chapter illustration: chapters may carry either a plain URL string or a
  // full image object with focal point, fit and Ken Burns settings.
  const image = chapter?.image;
  const imageUrl = typeof image === 'string' ? image : image?.url || '';
  const imagePosition = image?.focalPoint
    ? `${image.focalPoint.x * 100}% ${image.focalPoint.y * 100}%`
    : 'center';
  const imageFit = image?.fit === 'contain' ? 'contain' : 'cover';
  const kenBurnsEnabled = image?.kenBurns?.enabled;

  return (
    <div className="hsb">
      {/* Reading progress */}
      {totalChapters > 0 && !loading && (
        <div
          className="hsb-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Reading progress"
        >
          <div className="hsb-progress__fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Chrome */}
      <div className="hsb-topbar">
        {isChapter && (
          <span className="hsb-chip">
            Chapter {currentPage} of {totalChapters}
          </span>
        )}
        <span className="hsb-topbar__spacer" />
        <button
          type="button"
          className="hsb-iconbtn"
          onClick={handleClose}
          aria-label="Close story and return to the heritage map"
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="hsb-fill" aria-busy="true">
          <div className="hsb-fill__icon" aria-hidden="true">📖</div>
          <h1 className="hsb-fill__title">Opening the story…</h1>
        </div>
      )}

      {/* Error */}
      {!loading && (error || !site) && (
        <div className="hsb-fill">
          <div className="hsb-fill__icon" aria-hidden="true">📚</div>
          <h1 className="hsb-fill__title">Story not found</h1>
          <p className="hsb-fill__text">
            {error || 'We could not find a story for this monument.'}
          </p>
          <div className="hsb-plate__actions">
            <button type="button" className="hsb-btn hsb-btn--ghost" onClick={() => navigate('/storybook-demo')}>
              Browse all stories
            </button>
            <button type="button" className="hsb-btn" onClick={handleClose}>
              Back to map
            </button>
          </div>
        </div>
      )}

      {/* No chapters */}
      {!loading && !error && site && totalChapters === 0 && (
        <div className="hsb-fill">
          <div className="hsb-fill__icon" aria-hidden="true">📚</div>
          <h1 className="hsb-fill__title">No story chapters yet</h1>
          <p className="hsb-fill__text">
            This site has no written chapters and no history, architecture or significance
            text to build one from. Add a chapter file at{' '}
            <code>/chapters/{slug}.json</code> to give it a story.
          </p>
          <div className="hsb-plate__actions">
            <button type="button" className="hsb-btn hsb-btn--ghost" onClick={() => navigate('/storybook-demo')}>
              Browse all stories
            </button>
            <button type="button" className="hsb-btn" onClick={handleClose}>
              Back to map
            </button>
          </div>
        </div>
      )}

      {/* Cover */}
      {!loading && site && totalChapters > 0 && isCover && (
        <div className="hsb-scene" style={{ backgroundImage: `url(${coverImage})` }}>
          <div className="hsb-scene__frame" aria-hidden="true" />
          <div className="hsb-plate">
            <p className="hsb-plate__eyebrow">A heritage story</p>
            <h1 className="hsb-plate__title">{site.name}</h1>

            <div className="hsb-plate__meta">
              {site.category && <span className="hsb-tag">{site.category}</span>}
              {site.year && <span className="hsb-tag">{site.year}</span>}
              <span className="hsb-tag">
                {totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'}
              </span>
            </div>

            <div className="hsb-plate__actions">
              <button
                type="button"
                className="hsb-btn hsb-btn--lg"
                onClick={() => handlePageFlip('next')}
              >
                <span aria-hidden="true">📖</span> Open book
              </button>
            </div>

            <p className="hsb-hint">
              <kbd>←</kbd> <kbd>→</kbd> to turn pages · <kbd>Esc</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* Chapter spread */}
      {isChapter && chapter && (
        <div
          className={
            `hsb-spread${isFlipping ? ' is-turning' : ''}` +
            `${isFlipping && flipDirection === 'prev' ? ' is-turning-prev' : ''}`
          }
        >
          {/* Illustration */}
          <div className="hsb-pane hsb-pane--image">
            {imageUrl ? (
              <>
                <div
                  className="hsb-pane__photo"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: imageFit,
                    backgroundPosition: imagePosition,
                    transform: `scale(${kenBurnsScale})`,
                    transition: kenBurnsEnabled
                      ? `transform ${image?.kenBurns?.durationMs || 10000}ms ease-in-out`
                      : 'none'
                  }}
                />
                <div className="hsb-pane__veil" aria-hidden="true" />
                {image?.caption && <p className="hsb-pane__caption">{image.caption}</p>}
              </>
            ) : (
              <div className="hsb-pane__placeholder" aria-hidden="true">🏛️</div>
            )}
          </div>

          {/* Page */}
          <div className="hsb-pane hsb-pane--text">
            <header className="hsb-page__head">
              <div className="hsb-page__eyebrow">
                <span>Chapter {currentPage}</span>
                <span>{currentPage} / {totalChapters}</span>
              </div>
              <h2 className="hsb-page__title">{chapter.title}</h2>
            </header>

            <div className="hsb-page__body gs-scroll">
              <p className="hsb-prose hsb-prose--lead">
                {displayedText}
                {!typingDone && <span className="hsb-caret" aria-hidden="true" />}
              </p>
            </div>

            <footer className="hsb-page__foot">
              {!typingDone && (
                <button type="button" className="hsb-skip" onClick={skipTyping}>
                  Show full text
                </button>
              )}
            </footer>
          </div>
        </div>
      )}

      {/* Closing page */}
      {!loading && site && totalChapters > 0 && isLastPage && (
        <div className="hsb-scene" style={{ backgroundImage: `url(${coverImage})` }}>
          <div className="hsb-scene__frame" aria-hidden="true" />
          <div className="hsb-plate">
            <div className="hsb-fill__icon" aria-hidden="true">📚</div>
            <h2 className="hsb-plate__title">Journey complete</h2>
            <p className="hsb-plate__text">
              You have read the story of <strong>{site.name}</strong>. We hope it inspires
              you to visit and experience this place for yourself.
            </p>

            <div className="hsb-plate__actions">
              <button
                type="button"
                className="hsb-btn hsb-btn--ghost"
                onClick={() => goToPage(0, 'prev')}
              >
                <span aria-hidden="true">📖</span> Read again
              </button>
              <button
                type="button"
                className="hsb-btn hsb-btn--ghost"
                onClick={() => navigate('/storybook-demo')}
              >
                <span aria-hidden="true">📚</span> More stories
              </button>
              <button type="button" className="hsb-btn" onClick={handleClose}>
                <span aria-hidden="true">📍</span> Back to map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Narration needs a gesture before it can start */}
      {audioOverlayVisible && (
        <div className="hsb-overlay">
          <div className="hsb-overlay__card">
            <h3 className="hsb-overlay__title">Narration is ready</h3>
            <p className="hsb-overlay__text">
              Your browser blocks audio until you interact with the page.
            </p>
            <button
              type="button"
              className="hsb-btn"
              onClick={() => {
                setAudioOverlayVisible(false);
                audioRef.current?.play().catch(() => {});
              }}
            >
              <span aria-hidden="true">▶</span> Play narration
            </button>
          </div>
        </div>
      )}

      {/* Paging dock */}
      {totalChapters > 0 && !isCover && (
        <nav className="hsb-dock" aria-label="Story pages">
          <button
            type="button"
            className="hsb-dock__btn"
            onClick={() => handlePageFlip('prev')}
            disabled={isFlipping}
          >
            <span aria-hidden="true">◀</span> Prev
          </button>

          <div className="hsb-dots">
            {chapters.map((item, index) => (
              <button
                key={item.title ? `${item.title}-${index}` : index}
                type="button"
                className={`hsb-dot${currentPage === index + 1 ? ' is-active' : ''}`}
                onClick={() => goToPage(index + 1, index + 1 > currentPage ? 'next' : 'prev')}
                aria-label={`Chapter ${index + 1}: ${item.title || 'Untitled'}`}
                aria-current={currentPage === index + 1 ? 'page' : undefined}
                title={item.title}
              />
            ))}
          </div>

          <button
            type="button"
            className="hsb-dock__btn"
            onClick={() => handlePageFlip('next')}
            disabled={isFlipping || isLastPage}
          >
            Next <span aria-hidden="true">▶</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default HeritageStoryBook;

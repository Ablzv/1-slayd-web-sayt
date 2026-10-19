/* ==========================================================================
   PREMIUM 5-IMAGE INTERACTIVE SLIDER LOGIC
   Chingiz ("Yo yo yo qaytar qaytar vay bleee") & Jahongir Otajonov ("Faaah!")
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const slides = Array.from(document.querySelectorAll('.slide-item'));
  const totalSlides = slides.length;
  let currentIndex = 0; // 0-indexed (0 to 4)
  let isTransitioning = false;

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const counterCurr = document.getElementById('counter-curr');
  const counterTotal = document.getElementById('counter-total');
  const ambientGlow = document.getElementById('ambient-glow');
  const dotsContainer = document.getElementById('dots-container');
  const thumbsContainer = document.getElementById('thumbs-container');
  const slidesViewport = document.getElementById('slides-viewport');

  const btnAutoplay = document.getElementById('btn-autoplay');
  const autoplayIcon = document.getElementById('autoplay-icon');
  const autoplayText = document.getElementById('autoplay-text');
  const autoplayProgressBar = document.getElementById('autoplay-progress');

  const btnSound = document.getElementById('btn-sound');
  const soundText = document.getElementById('sound-text');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Meme Bubble & Audio Elements
  const memeBubble = document.getElementById('meme-bubble');
  const speechQuote = document.getElementById('speech-quote');
  const btnPlayChingiz = document.getElementById('btn-play-chingiz');
  const btnPlayFaaah = document.getElementById('btn-play-faaah');

  const audioChingiz = document.getElementById('audio-chingiz');
  const audioFaaah = document.getElementById('audio-faaah');

  // State
  let soundEnabled = true;
  let autoplayEnabled = false;
  let progressInterval = null;
  const AUTOPLAY_DURATION = 5000;
  let progressTime = 0;

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Set total slides in UI
  counterTotal.textContent = String(totalSlides).padStart(2, '0');

  // --------------------------------------------------------------------------
  // Audio Controller (Chingiz & Faaah MP3s)
  // --------------------------------------------------------------------------
  function stopAllAudios() {
    if (audioChingiz) {
      audioChingiz.pause();
      audioChingiz.currentTime = 0;
    }
    if (audioFaaah) {
      audioFaaah.pause();
      audioFaaah.currentTime = 0;
    }
  }

  function playChingiz() {
    if (!soundEnabled || !audioChingiz) return;
    try {
      stopAllAudios();
      audioChingiz.currentTime = 0;
      audioChingiz.play().catch(e => console.warn('Audio play error:', e));

      // Visual reaction
      if (memeBubble) {
        memeBubble.className = 'meme-speech-bubble bubble-panic';
        speechQuote.textContent = "😱 YO YO YO! QAYTAR, QAYTAR! VAYY BLEEEEE! 😭💥";
      }

      // Screen shake
      if (slidesViewport) {
        slidesViewport.classList.remove('screen-shake');
        void slidesViewport.offsetWidth; // reflow
        slidesViewport.classList.add('screen-shake');
      }
    } catch (err) {
      console.warn('Audio error:', err);
    }
  }

  function playFaaah() {
    if (!soundEnabled || !audioFaaah) return;
    try {
      stopAllAudios();
      audioFaaah.currentTime = 0;
      audioFaaah.play().catch(e => console.warn('Audio play error:', e));

      // Visual reaction
      if (memeBubble) {
        memeBubble.className = 'meme-speech-bubble bubble-peace';
        speechQuote.textContent = "🎤 FAAAAAAH! QAYTDI! 😂🔥";
      }

      if (slidesViewport) {
        slidesViewport.classList.remove('screen-shake');
      }
    } catch (err) {
      console.warn('Audio error:', err);
    }
  }

  // Quick action buttons
  if (btnPlayChingiz) {
    btnPlayChingiz.addEventListener('click', playChingiz);
  }

  if (btnPlayFaaah) {
    btnPlayFaaah.addEventListener('click', playFaaah);
  }

  // --------------------------------------------------------------------------
  // Generate Bottom Dots and Mini Thumbnails
  // --------------------------------------------------------------------------
  function createNavigationElements() {
    dotsContainer.innerHTML = '';
    thumbsContainer.innerHTML = '';

    slides.forEach((slide, idx) => {
      // 1. Dots
      const dot = document.createElement('button');
      dot.className = `dot-btn ${idx === currentIndex ? 'active' : ''}`;
      dot.title = `${idx + 1}-rasm`;
      dot.setAttribute('aria-label', `${idx + 1}-rasmga o'tish`);
      dot.addEventListener('click', () => {
        if (idx !== currentIndex) {
          const dir = idx > currentIndex ? 'forward' : 'backward';
          goToSlide(idx, dir);
        }
      });
      dotsContainer.appendChild(dot);

      // 2. Thumbnails
      const img = slide.querySelector('.slide-img');
      const imgSrc = img ? img.getAttribute('src') : '';
      const thumb = document.createElement('div');
      thumb.className = `thumb-item ${idx === currentIndex ? 'active' : ''}`;
      thumb.title = slide.querySelector('.slide-title')?.textContent || `${idx + 1}-rasm`;
      thumb.innerHTML = `<img src="${imgSrc}" alt="thumb-${idx + 1}">`;
      thumb.addEventListener('click', () => {
        if (idx !== currentIndex) {
          const dir = idx > currentIndex ? 'forward' : 'backward';
          goToSlide(idx, dir);
        }
      });
      thumbsContainer.appendChild(thumb);
    });
  }

  createNavigationElements();

  // --------------------------------------------------------------------------
  // Direction-Aware Slide Transition Engine
  // --------------------------------------------------------------------------
  function goToSlide(targetIndex, direction = 'forward') {
    if (isTransitioning || targetIndex === currentIndex) return;
    isTransitioning = true;

    const outgoingSlide = slides[currentIndex];
    const incomingSlide = slides[targetIndex];
    const accent = incomingSlide.dataset.accent || '#00f2fe';

    // 1. Play real MP3 voice based on direction:
    // O'ngga bossa -> Chingiz ("Yo yo yo qaytar qaytar vay bleee")
    // Chapga bossa (qaytarsa) -> Jahongir Otajonov ("Faaah!")
    if (direction === 'forward') {
      playChingiz();
    } else {
      playFaaah();
    }

    // 2. Dynamic Accent and Ambient Glow
    document.documentElement.style.setProperty('--accent-active', accent);
    if (ambientGlow) {
      ambientGlow.style.background = `radial-gradient(circle at 50% 50%, ${accent}33 0%, transparent 65%)`;
    }

    // 3. Clear existing transition classes
    slides.forEach(s => {
      s.classList.remove(
        'slide-out-left',
        'slide-in-right',
        'slide-out-right',
        'slide-in-left'
      );
    });

    // 4. Apply Direction Classes
    if (direction === 'forward') {
      outgoingSlide.classList.add('slide-out-left');
      incomingSlide.classList.add('slide-in-right', 'active');
    } else {
      outgoingSlide.classList.add('slide-out-right');
      incomingSlide.classList.add('slide-in-left', 'active');
    }

    // 5. Update index
    currentIndex = targetIndex;
    counterCurr.textContent = String(currentIndex + 1).padStart(2, '0');

    // 6. Update Dots and Thumbnails UI
    updateDotsAndThumbs();

    // 7. Reset autoplay timer if active
    if (autoplayEnabled) {
      restartAutoplay();
    }

    // 8. Clean up animation classes once transition completes
    setTimeout(() => {
      outgoingSlide.classList.remove('active', 'slide-out-left', 'slide-out-right');
      incomingSlide.classList.remove('slide-in-right', 'slide-in-left');
      isTransitioning = false;
    }, 750);
  }

  function nextSlide() {
    const nextIdx = (currentIndex + 1) % totalSlides;
    goToSlide(nextIdx, 'forward');
  }

  function prevSlide() {
    const prevIdx = (currentIndex - 1 + totalSlides) % totalSlides;
    goToSlide(prevIdx, 'backward');
  }

  function updateDotsAndThumbs() {
    const dots = dotsContainer.querySelectorAll('.dot-btn');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    const thumbs = thumbsContainer.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === currentIndex);
    });
  }

  // Button Event Listeners
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // --------------------------------------------------------------------------
  // Keyboard Navigation
  // --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;

      case 'f':
      case 'F':
        toggleFullscreen();
        break;

      case 'm':
      case 'M':
        toggleSound();
        break;

      case 'p':
      case 'P':
        toggleAutoplay();
        break;
    }
  });

  // --------------------------------------------------------------------------
  // Touch Gestures (Swipe for Mobile & Tablets)
  // --------------------------------------------------------------------------
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = document.getElementById('slides-viewport');

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // --------------------------------------------------------------------------
  // Autoplay with Animated Progress Bar
  // --------------------------------------------------------------------------
  function startAutoplay() {
    autoplayEnabled = true;
    document.body.classList.add('autoplay-active');
    autoplayText.textContent = 'Avto: Yoqiq';
    autoplayIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) window.lucide.createIcons();

    progressTime = 0;
    autoplayProgressBar.style.width = '0%';

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      progressTime += 100;
      const pct = (progressTime / AUTOPLAY_DURATION) * 100;
      autoplayProgressBar.style.width = `${pct}%`;

      if (progressTime >= AUTOPLAY_DURATION) {
        progressTime = 0;
        nextSlide();
      }
    }, 100);
  }

  function stopAutoplay() {
    autoplayEnabled = false;
    document.body.classList.remove('autoplay-active');
    autoplayText.textContent = 'Avto: O\'chiq';
    autoplayIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();

    clearInterval(progressInterval);
    autoplayProgressBar.style.width = '0%';
  }

  function restartAutoplay() {
    if (!autoplayEnabled) return;
    progressTime = 0;
    autoplayProgressBar.style.width = '0%';
  }

  function toggleAutoplay() {
    if (autoplayEnabled) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  btnAutoplay.addEventListener('click', toggleAutoplay);

  // --------------------------------------------------------------------------
  // Sound & Fullscreen Controls
  // --------------------------------------------------------------------------
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('sound-icon');
    if (soundEnabled) {
      icon.setAttribute('data-lucide', 'volume-2');
      soundText.textContent = 'Ovoz: Yoqiq';
    } else {
      icon.setAttribute('data-lucide', 'volume-x');
      soundText.textContent = 'Ovoz: O\'chiq';
      stopAllAudios();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  btnSound.addEventListener('click', toggleSound);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  btnFullscreen.addEventListener('click', toggleFullscreen);

  // Set initial accent color
  const initialAccent = slides[0].dataset.accent || '#00f2fe';
  document.documentElement.style.setProperty('--accent-active', initialAccent);
  if (ambientGlow) {
    ambientGlow.style.background = `radial-gradient(circle at 50% 50%, ${initialAccent}33 0%, transparent 65%)`;
  }
});

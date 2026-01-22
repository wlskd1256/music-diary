import React, { useState, useRef, useMemo, useEffect } from 'react';
import Draggable from 'react-draggable';
import './App.css';

// ⚠️ 이미지 파일 이름 확인 (프로젝트 폴더에 이 파일들이 있어야 합니다)
import posterImg from './poster.png'; 
import coverImg from './cover.png';   
import receiptImg from './receipt_europe.png'; 
// ✨ [중요] 배경용 이미지 (intro-bg.png가 있어야 합니다)
import chevronImg from './intro-bg.png'; 
// ✨ 인트로 전용 커서 이미지 (붉은 원)
import cursorImg from './Group 115.png';

// 컨트롤러 아이콘
import prevIcon from './prev.png';
import nextIcon from './next.png';
import shuffleIcon from './shuffle.png';
import pauseIcon from './pause.png'; 
import playIcon from './play.png';    

// 한글 포함 여부 확인 함수
const hasKorean = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

// --- ✨ [인트로] 고해상도 파티클 (Dust Effect) + 커스텀 커서 ---
const ParticleIntro = ({ onEnter }) => {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null); // 커스텀 커서용 ref
  const mouseRef = useRef({ x: null, y: null, radius: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    
    // 마우스 이벤트 핸들러
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    
    const handleMouseLeave = () => {
        mouseRef.current.x = null;
        mouseRef.current.y = null;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // 파티클 클래스 정의
    class Particle {
      constructor(x, y) {
        this.originX = x; 
        this.originY = y; 
        this.x = x; 
        this.y = y; 
        this.size = 2; // 입자 크기
        this.color = 'white'; 
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.95; 
        this.ease = 0.1;      
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }

      update() {
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distanceSq = dx * dx + dy * dy; 
        const forceRadius = 15000; 

        if (distanceSq < forceRadius) { 
            const distance = Math.sqrt(distanceSq);
            const force = (Math.sqrt(forceRadius) - distance) / Math.sqrt(forceRadius);
            const angle = Math.atan2(dy, dx);
            const push = 20; 
            
            this.vx -= force * Math.cos(angle) * push;
            this.vy -= force * Math.sin(angle) * push;
        }

        this.vx += (this.originX - this.x) * this.ease;
        this.vy += (this.originY - this.y) * this.ease;
        
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;

        this.draw();
      }
    }

    // 이미지 로드 및 파티클 생성
    const image = new Image();
    image.src = chevronImg; 

    image.onload = () => {
      // ✨ [수정됨] 화면을 꽉 채우도록 비율 계산 (Cover 모드)
      const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
      
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;
      
      // 이미지를 정중앙에 배치
      const dx = (canvas.width - imgWidth) / 2;
      const dy = (canvas.height - imgHeight) / 2;

      ctx.drawImage(image, dx, dy, imgWidth, imgHeight);
      
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height); 

      // ✨ [수정됨] 입자 간격 (Gap) 설정
      // 화면 전체를 채울 때는 입자가 너무 많아지므로 4 -> 12 정도로 늘려서 성능 최적화
      const gap = 12; 

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const index = (y * 4 * pixels.width) + (x * 4);
          const alpha = pixels.data[index + 3]; 
          
          if (alpha > 0) { 
            particlesArray.push(new Particle(x, y));
          }
        }
      }
      animate();
    };

    function animate() {
      ctx.fillStyle = 'black'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
          particlesArray[i].update();
      }
      requestAnimationFrame(animate);
    }

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="intro-wrapper" onClick={onEnter} style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: 'black', overflow: 'hidden' }}>
        {/* 커스텀 커서 */}
        <img 
            ref={cursorRef} 
            src={cursorImg} 
            alt="Cursor" 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '50px', 
                pointerEvents: 'none', 
                zIndex: 9999,
                mixBlendMode: 'screen', 
                willChange: 'transform' 
            }}
        />
        <canvas 
            ref={canvasRef} 
            className="intro-canvas"
            style={{ 
                display: 'block',
                cursor: 'none' 
            }} 
        />
    </div>
  );
};


// --- [메인] 드래그 아이템 컴포넌트 ---
const DraggableItem = ({ item, isSelected, onSelect, onDelete, onStopDrag, onPlayPause, onNext, onPrev, onShuffle, isGlobalPlaying, currentTime, duration, songsOnDate, onDeleteTrack }) => {
  const nodeRef = useRef(null);
  
  const containerStyle = {
    zIndex: isSelected ? 1000 : item.zIndex,
    position: 'absolute',
    width: (item.type === 'RECEIPT' || item.type === 'PLAYER_WIDGET' || item.type === 'TIME_DISPLAY' || item.type === 'SONG_TITLE') ? 'auto' : (item.width ? `${item.width}px` : 'auto'),
    height: (item.type === 'RECEIPT' || item.type === 'PLAYER_WIDGET' || item.type === 'TIME_DISPLAY' || item.type === 'SONG_TITLE') ? 'auto' : (item.height ? `${item.height}px` : 'auto'),
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: 'grab',
  };

  const rotationStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `rotate(${item.rotation || 0}deg)`,
    backgroundColor: item.type === 'SHAPE' ? item.backgroundColor : 'transparent',
    borderRadius: item.borderRadius ? `${item.borderRadius}px` : '0px',
    border: item.borderWidth ? `${item.borderWidth}px solid ${item.borderColor}` : 'none',
    boxShadow: isSelected ? '0 0 0 2px #007bff' : 'none',
  };

  const animationClass = item.isSpinning ? 'spinning-infinite' : '';

  const formatTime = (time) => { 
    if (!time || isNaN(time)) return "0:00"; 
    const minutes = Math.floor(time / 60); 
    const seconds = Math.floor(time % 60); 
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; 
  };

  return (
    <Draggable 
      nodeRef={nodeRef} 
      bounds="parent" 
      defaultPosition={{x: item.x, y: item.y}} 
      onStart={() => onSelect(item.id)}
      onStop={(e, data) => onStopDrag(item.id, data.x, data.y)} 
    >
      <div 
        ref={nodeRef} 
        className="draggable-item"
        onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
        style={containerStyle} 
      >
        <div className={`rotate-wrapper ${animationClass}`} style={rotationStyle}>
            {isSelected && (
                <button className="delete-x-btn" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>×</button>
            )}

            {item.type === 'PLAYER_WIDGET' && (
              <div className="player-widget-item">
                 <img src={prevIcon} className="pw-icon small" alt="prev" onMouseDown={(e) => {e.stopPropagation(); onPrev()}} />
                 <img 
                    src={isGlobalPlaying ? pauseIcon : playIcon} 
                    className="pw-icon big" 
                    alt="play/pause" 
                    onMouseDown={(e) => { e.stopPropagation(); onPlayPause(); }} 
                  />
                 <img src={nextIcon} className="pw-icon small" alt="next" onMouseDown={(e) => {e.stopPropagation(); onNext()}} />
                 <img src={shuffleIcon} className="pw-icon small" alt="shuffle" onMouseDown={(e) => {e.stopPropagation(); onShuffle()}} />
              </div>
            )}

            {item.type === 'SONG_TITLE' && (
              <div 
                className="song-text-title" 
                style={{
                    color: item.color || '#000',
                    fontSize: `${item.fontSize}px`, 
                    fontFamily: hasKorean(item.content) ? 'Arial, sans-serif' : "'Wallpoet', cursive"
                }}
              >
                 {item.content}
              </div>
            )}

            {item.type === 'TIME_DISPLAY' && (
               <div 
                  className="time-display-widget" 
                  style={{
                      color: item.color || '#000',
                      fontSize: `${item.fontSize || 14}px` 
                  }}
               >
                  {formatTime(currentTime)} / -{formatTime(Math.max(0, duration - currentTime))}
               </div>
            )}
            
            {item.type === 'SHAPE' && <div style={{width:'100%', height:'100%'}}></div>}

            {item.type === 'IMAGE' && (
              <img 
                src={item.image} 
                alt="Deco" 
                className={item.isGrayscale ? 'grayscale' : ''} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: item.borderRadius ? `${item.borderRadius}px` : 0 }} 
              />
            )}
            
            {item.type === 'TEXT' && (
              <div className="text-content" style={{ color: item.color, fontSize: `${item.fontSize}px`, fontFamily: item.fontFamily, width:'100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', whiteSpace: 'pre-wrap', backgroundColor: item.backgroundColor, borderRadius: item.borderRadius ? `${item.borderRadius}px` : 0 }}>
                {item.content}
              </div>
            )}

            {item.type === 'RECEIPT' && (
                <div className={`receipt-wrapper ${item.isGrayscale ? 'grayscale' : ''}`}>
                    <img src={receiptImg} alt="Receipt Base" className="receipt-base-img" />
                    <div className="receipt-simple-box">
                        {songsOnDate && songsOnDate.length > 0 ? (
                            <div className="r-simple-list">
                                {songsOnDate.map((song, index) => (
                                    <div key={song.id || index} className="r-simple-item">
                                        <div className="r-item-left">
                                            <div className="r-simple-title" style={{fontFamily: hasKorean(song.title) ? 'Arial' : 'Economica'}}>{song.title}</div> 
                                            <div className="r-simple-artist" style={{fontFamily: hasKorean(song.artist) ? 'Arial' : 'Economica'}}>{song.artist}</div>
                                            <div className="r-count" style={{fontFamily: 'Economica, sans-serif', fontSize: '0.8rem', color: '#666'}}>{song.playCount}x</div>
                                        </div>
                                        <div 
                                            className="r-delete-btn" 
                                            onMouseDown={(e) => { e.stopPropagation(); onDeleteTrack(song.id); }}
                                        >
                                            ×
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="r-empty-simple">No Music</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Draggable>
  );
};

// --- [메인] App 로직 ---
function App() {
  const diarySectionRef = useRef(null);
  const yearRef = useRef(null); 
  const plAudioRef = useRef(null);
  const edAudioRef = useRef(null);
  const volumeRef = useRef(null);

  const [currentStep, setCurrentStep] = useState('LANDING');
  
  const [allDiaries, setAllDiaries] = useState(() => {
    const saved = localStorage.getItem('music_diary_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [animDir, setAnimDir] = useState(null);
  const animTimeoutRef = useRef(null);

  const [bgColor, setBgColor] = useState('#ffffff'); 
  const [query, setQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState([]); 
  const [diaryItems, setDiaryItems] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [originalFont, setOriginalFont] = useState(''); 

  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [playlistMonthIdx, setPlaylistMonthIdx] = useState(0);

  // Playlist State
  const [plSong, setPlSong] = useState(null);
  const [isPlPlaying, setIsPlPlaying] = useState(false);
  const [plTime, setPlTime] = useState(0);
  const [plDuration, setPlDuration] = useState(0);

  // Editor State
  const [edSong, setEdSong] = useState(null);
  const [isEdPlaying, setIsEdPlaying] = useState(false);
  const [edTime, setEdTime] = useState(0);
  const [edDuration, setEdDuration] = useState(0);

  const [volume, setVolume] = useState(50);

  useEffect(() => { localStorage.setItem('music_diary_data', JSON.stringify(allDiaries)); }, [allDiaries]);

  const selectedItem = useMemo(() => diaryItems.find(item => item.id === selectedId), [diaryItems, selectedId]);
  
  const songsOnDate = useMemo(() => diaryItems.filter(item => item.type === 'PLAYLIST_TRACK'), [diaryItems]);

  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  const monthOffsets = useMemo(() => {
    const counts = months.map((_, index) => {
      const monthPrefix = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      return Object.keys(allDiaries).filter(key => key.startsWith(monthPrefix)).length;
    });
    return counts.map(count => Math.max(0, (counts[0] - count) * 15));
  }, [allDiaries, currentYear]);

  const recentSongs = useMemo(() => {
    const allItems = Object.values(allDiaries).flat();
    const songs = allItems.filter(item => item.type === 'PLAYLIST_TRACK'); 
    const uniqueSongs = Array.from(new Map(songs.map(song => [song.title + song.artist, song])).values()); 
    return uniqueSongs.reverse();
  }, [allDiaries]);

  const currentMonthFolderSongs = useMemo(() => {
    const monthStr = String(playlistMonthIdx + 1).padStart(2, '0'); 
    const monthPrefix = `${currentYear}-${monthStr}`;
    const monthKeys = Object.keys(allDiaries).filter(key => key.startsWith(monthPrefix)).sort();
    let songs = [];
    monthKeys.forEach(key => {
        const dailySongs = allDiaries[key].filter(item => item.type === 'PLAYLIST_TRACK');
        dailySongs.forEach(song => songs.push({ ...song, date: key.slice(5) })); 
    });
    return songs.sort((a, b) => a.id - b.id);
  }, [allDiaries, currentYear, playlistMonthIdx]);

  const getDaysArray = (year, monthIndex) => {
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };
  
  // --- Audio Handlers ---
  useEffect(() => { if (plAudioRef.current) plAudioRef.current.volume = volume / 100; }, [volume]);
  useEffect(() => { if (plAudioRef.current) { if (isPlPlaying) plAudioRef.current.play().catch(e => console.log(e)); else plAudioRef.current.pause(); } }, [isPlPlaying, plSong]);
  const handlePlTimeUpdate = () => { if (plAudioRef.current) setPlTime(plAudioRef.current.currentTime); };
  const handlePlLoadedMetadata = () => { if (plAudioRef.current) setPlDuration(plAudioRef.current.duration); };
  const handlePlSongEnded = () => { 
      if (!plSong || playlistQueue.length === 0) { setIsPlPlaying(false); return; } 
      const currentIndex = playlistQueue.findIndex(s => s.id === plSong.id); 
      if (currentIndex !== -1 && currentIndex < playlistQueue.length - 1) { setPlSong(playlistQueue[currentIndex + 1]); } 
      else { setIsPlPlaying(false); } 
  };
  const handlePlSeek = (e) => { 
      const progressBar = e.currentTarget; const rect = progressBar.getBoundingClientRect(); 
      const clickX = e.clientX - rect.left; const width = rect.width; 
      const newTime = (clickX / width) * plDuration; 
      if (plAudioRef.current && isFinite(newTime)) { plAudioRef.current.currentTime = newTime; setPlTime(newTime); } 
  };

  useEffect(() => { if (edAudioRef.current) edAudioRef.current.volume = volume / 100; }, [volume]);
  useEffect(() => { if (edAudioRef.current) { if (isEdPlaying) edAudioRef.current.play().catch(e => console.log(e)); else edAudioRef.current.pause(); } }, [isEdPlaying, edSong]);
  const handleEdTimeUpdate = () => { if (edAudioRef.current) setEdTime(edAudioRef.current.currentTime); };
  const handleEdLoadedMetadata = () => { if (edAudioRef.current) setEdDuration(edAudioRef.current.duration); };
  const handleEdSongEnded = () => { setIsEdPlaying(false); };

  const handleWidgetPlayPause = () => setIsEdPlaying(!isEdPlaying);
  const handleWidgetNext = () => {}; 
  const handleWidgetPrev = () => {};
  const handleWidgetShuffle = () => {};

  const formatTime = (time) => { if (!time || isNaN(time)) return "0:00"; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };
  const formatRemainingTime = (dur, curr) => { if (!dur || isNaN(dur)) return "-0:00"; const remaining = dur - curr; return "-" + formatTime(remaining); };

  useEffect(() => { const volElement = volumeRef.current; if (!volElement) return; const handleVolumeWheel = (e) => { e.preventDefault(); e.stopPropagation(); if (e.deltaY < 0) setVolume(prev => Math.min(100, prev + 10)); else setVolume(prev => Math.max(0, prev - 10)); }; volElement.addEventListener('wheel', handleVolumeWheel, { passive: false }); return () => { volElement.removeEventListener('wheel', handleVolumeWheel); }; }, [currentStep]);
  useEffect(() => { const yearElement = yearRef.current; if (!yearElement) return; const handleWheel = (e) => { e.preventDefault(); if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current); if (e.deltaY < 0) { setAnimDir('down'); animTimeoutRef.current = setTimeout(() => { setCurrentYear((prev) => prev - 1); setAnimDir(null); }, 400); } else { setAnimDir('up'); animTimeoutRef.current = setTimeout(() => { setCurrentYear((prev) => prev + 1); setAnimDir(null); }, 400); } }; yearElement.addEventListener('wheel', handleWheel, { passive: false }); return () => { yearElement.removeEventListener('wheel', handleWheel); if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current); }; }, [currentStep]);

  const handleLandingClick = () => { 
      setCurrentStep('DIARY'); 
      setTimeout(() => { diarySectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100); 
  };

  const handleDateClick = (monthIndex, day) => { 
      const dateKey = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; 
      setSelectedDateKey(dateKey); 
      
      const items = allDiaries[dateKey] || [];
      setDiaryItems(items); 
      
      const track = items.find(item => item.type === 'PLAYLIST_TRACK');
      if (track) {
          setEdSong({
              audio: track.audio,
              title: track.title,
              artist: track.artist,
              image: track.image
          });
          setIsEdPlaying(true);
      } else {
          setIsEdPlaying(false);
      }

      setCurrentStep('EDITOR'); 
  };

  const handleBackToCalendar = () => { 
      if (selectedDateKey) { setAllDiaries(prev => ({ ...prev, [selectedDateKey]: diaryItems })); } 
      setIsEdPlaying(false);
      setCurrentStep('DIARY'); 
  };
  
  const goToPlaylist = () => { 
      const thisMonthIdx = new Date().getMonth(); setPlaylistMonthIdx(thisMonthIdx); 
      const monthStr = String(thisMonthIdx + 1).padStart(2, '0'); 
      const monthPrefix = `${currentYear}-${monthStr}`; 
      
      let currentDiaries = allDiaries;
      if (selectedDateKey) {
          currentDiaries = { ...allDiaries, [selectedDateKey]: diaryItems };
          setAllDiaries(currentDiaries); 
      }

      const monthKeys = Object.keys(currentDiaries).filter(key => key.startsWith(monthPrefix)).sort(); 
      let monthlySongs = []; 
      monthKeys.forEach(key => { 
          const dailySongs = currentDiaries[key].filter(item => item.type === 'PLAYLIST_TRACK'); 
          dailySongs.sort((a, b) => a.id - b.id); 
          dailySongs.forEach(song => monthlySongs.push({ ...song, date: key.slice(5) })); 
      }); 
      monthlySongs.sort((a, b) => a.id - b.id); 

      if (monthlySongs.length > 0) { setPlSong(monthlySongs[0]); setPlaylistQueue(monthlySongs); } 
      else { setPlSong(null); setPlaylistQueue([]); } 
      
      setShowPlaylistOverlay(false); 
      setIsEdPlaying(false); 
      setCurrentStep('PLAYLIST'); 
  };

  const backToDiary = () => { if (showPlaylistOverlay) setShowPlaylistOverlay(false); else setCurrentStep('DIARY'); };
  const togglePlaylist = () => setShowPlaylistOverlay(!showPlaylistOverlay);
  const playPlaylistSong = (song) => { setPlSong(song); setPlaylistQueue(recentSongs); setIsPlPlaying(true); if (currentStep !== 'EDITOR') { setCurrentStep('PLAYLIST'); } };
  
  const playEditorSong = (song) => {
    setEdSong(song);
    setIsEdPlaying(true);
    if (selectedDateKey) {
        setDiaryItems(prevItems => 
            prevItems.map(item => {
                if (item.type === 'PLAYLIST_TRACK' && item.title === song.trackName && item.artist === song.artist) {
                    return { ...item, playCount: (item.playCount || 0) + 1 };
                }
                return item;
            })
        );
    }
  };

  const handlePlaylistFolderClick = (song) => { setPlSong(song); setPlaylistQueue([song]); setIsPlPlaying(true); setShowPlaylistOverlay(false); }
  const handleMonthFolderClick = () => { if (currentMonthFolderSongs.length > 0) { setPlaylistQueue(currentMonthFolderSongs); setPlSong(currentMonthFolderSongs[0]); setIsPlPlaying(true); setShowPlaylistOverlay(false); } else { alert(`${months[playlistMonthIdx].toUpperCase()}에 저장된 노래가 없습니다.`); } };
  const handleMonthTitleClick = () => { const nextMonthIdx = (playlistMonthIdx + 1) % 12; setPlaylistMonthIdx(nextMonthIdx); const monthStr = String(nextMonthIdx + 1).padStart(2, '0'); const monthPrefix = `${currentYear}-${monthStr}`; const monthKeys = Object.keys(allDiaries).filter(key => key.startsWith(monthPrefix)).sort(); let newSongs = []; monthKeys.forEach(key => { const dailySongs = allDiaries[key].filter(item => item.type === 'PLAYLIST_TRACK'); dailySongs.sort((a, b) => a.id - b.id); dailySongs.forEach(song => newSongs.push({ ...song, date: key.slice(5) })); }); newSongs.sort((a, b) => a.id - b.id); if (newSongs.length > 0) { setPlaylistQueue(newSongs); setPlSong(newSongs[0]); setIsPlPlaying(true); } else { setPlaylistQueue([]); setPlSong(null); setIsPlPlaying(false); } };

  const searchMusic = async () => { 
    if (!query) return; 
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`);
        const data = await response.json();
        setSearchResults(data.results);
    } catch (e) { console.error(e); alert("검색 중 오류가 발생했습니다."); }
  };

  const addItem = (item) => { setDiaryItems(prev => [...prev, item]); setSearchResults([]); setQuery(''); setIsMenuOpen(false); };
  
  const addToDiary = (song) => { 
    const highResImage = song.artworkUrl100.replace('100x100bb', '600x600bb');
    const existingWidget = diaryItems.find(i => i.type === 'PLAYER_WIDGET');
    const existingTitle = diaryItems.find(i => i.type === 'SONG_TITLE');
    const existingTime = diaryItems.find(i => i.type === 'TIME_DISPLAY');
    const existingTrack = diaryItems.find(i => i.type === 'PLAYLIST_TRACK' && i.title === song.trackName && i.artist === song.artist);

    playEditorSong({ ...song, image: highResImage, audio: song.previewUrl, trackName: song.trackName, artist: song.artistName });

    setDiaryItems(prev => {
        let nextItems = [...prev];
        if (existingWidget && existingTitle && existingTime) {
            nextItems = nextItems.map(item => {
                if (item.type === 'SONG_TITLE') return { ...item, content: song.trackName, artist: song.artistName };
                return item;
            });
        } else {
            const newWidget = { id: Date.now(), type: 'PLAYER_WIDGET', x: 200, y: 200, zIndex: prev.length + 1, isSpinning: false };
            const newTitle = { id: Date.now() + 1, type: 'SONG_TITLE', content: song.trackName, artist: song.artistName, x: 200, y: 150, zIndex: prev.length + 2, isSpinning: false, color: '#000000', fontSize: 30 };
            const newTime = { id: Date.now() + 2, type: 'TIME_DISPLAY', x: 200, y: 250, zIndex: prev.length + 3, isSpinning: false, color: '#000000', fontSize: 14 };
            nextItems.push(newWidget, newTitle, newTime);
        }
        if (!existingTrack) {
            nextItems.push({
                id: Date.now() + 3, type: 'PLAYLIST_TRACK',
                title: song.trackName, artist: song.artistName, playCount: 1, 
                audio: song.previewUrl, image: highResImage 
            });
        } else {
             nextItems = nextItems.map(item => (item.id === existingTrack.id) ? { ...item, playCount: (item.playCount || 0) + 1 } : item);
        }
        return nextItems;
    });
    setSearchResults([]); setQuery(''); setIsMenuOpen(false);
  };

  const addShape = () => { const newItem = { id: Date.now(), type: 'SHAPE', backgroundColor: '#000000', width: 100, height: 100, x: window.innerWidth/2 - 50, y: window.innerHeight/2 - 50, borderRadius: 0, borderWidth: 0, borderColor: '#000000', isSpinning: false, zIndex: diaryItems.length + 1 }; addItem(newItem); };
  const handleAddText = () => { const newItem = { id: Date.now(), type: 'TEXT', content: 'Double click', color: '#ffffff', backgroundColor: '#000000', fontSize: 16, fontFamily: 'Arial', width: 150, height: 50, x: window.innerWidth/2-75, y: window.innerHeight/2-25, borderRadius: 0, borderWidth: 0, borderColor: '#000000', isSpinning: false, zIndex: diaryItems.length + 1 }; addItem(newItem); };
  const handleAddPhoto = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const newItem = { id: Date.now(), type: 'IMAGE', image: reader.result, width: 150, height: 150, x: 150, y: 150, borderRadius: 0, isSpinning: false, zIndex: diaryItems.length + 1 }; addItem(newItem); }; reader.readAsDataURL(file); } };
  const addReceipt = () => { const newItem = { id: Date.now(), type: 'RECEIPT', width: 250, height: 'auto', x: window.innerWidth/2-125, y: window.innerHeight/2-150, zIndex: diaryItems.length + 1, isGrayscale: false, isSpinning: false, rotation: 0 }; addItem(newItem); };

  const deleteItem = (id) => { setDiaryItems(diaryItems.filter(item => item.id !== id)); if (selectedId === id) setSelectedId(null); };
  const deleteTrack = (id) => { setDiaryItems(prev => prev.filter(item => item.id !== id)); };
  
  const handleStopDrag = (id, x, y) => { setDiaryItems(prev => prev.map(item => item.id === id ? { ...item, x, y } : item)); };
  const updateItem = (key, value) => { if (!selectedId) return; setDiaryItems(diaryItems.map(item => item.id === selectedId ? { ...item, [key]: value } : item)); };
  
  const handleFontHover = (font) => { if(!selectedId) return; if(!originalFont) setOriginalFont(selectedItem.fontFamily); updateItem('fontFamily', font); };
  const handleFontLeave = () => { if(!selectedId || !originalFont) return; updateItem('fontFamily', originalFont); };
  const handleFontClick = (font) => { if(!selectedId) return; setOriginalFont(font); updateItem('fontFamily', font); setShowFontList(false); };
  const fontList = ['Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Brush Script MT', 'Impact', 'Comic Sans MS', 'Helvetica', 'Gungsuh', 'Malgun Gothic', 'Batang'];
  
  return (
    <div className="full-page-container" onClick={() => { setSelectedId(null); setIsMenuOpen(false); setShowFontList(false); }}>
      <audio ref={plAudioRef} src={plSong?.audio} onTimeUpdate={handlePlTimeUpdate} onLoadedMetadata={handlePlLoadedMetadata} onEnded={handlePlSongEnded} />
      <audio ref={edAudioRef} src={edSong?.audio} onTimeUpdate={handleEdTimeUpdate} onLoadedMetadata={handleEdLoadedMetadata} onEnded={handleEdSongEnded} />

      {currentStep === 'LANDING' && (<ParticleIntro onEnter={handleLandingClick} />)}
      {currentStep === 'DIARY' && (<section ref={diarySectionRef} className="diary-section animate-fade-in"><div className="calendar-layout"><div className="calendar-header"><div className="year-wrapper" ref={yearRef}><h1 key={currentYear} className={`big-year ${animDir ? `slide-${animDir}` : ''}`}>{currentYear}</h1></div><div className="right-header-group"><h2 className="playlist-link" onClick={goToPlaylist}>PLAYLIST</h2><div className="recent-list-container scroll-container">{recentSongs.length === 0 ? <div className="empty-message">No songs yet...</div> : recentSongs.slice(0, 20).map((song, idx) => (<div key={idx} className="recent-item" onClick={() => playPlaylistSong(song)}><span className="recent-title">{song.title}</span><span className="recent-artist">{song.artist}</span></div>))}</div></div></div><div className="calendar-grid">{months.map((monthName, index) => { const daysInMonth = getDaysArray(currentYear, index); const offset = monthOffsets[index]; return (<div key={monthName} className="month-column" style={{ marginTop: `${offset}px` }}><div className="month-header">{monthName}</div><div className="days-wrapper">{daysInMonth.map(day => { const dateKey = `${currentYear}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const hasEntry = allDiaries[dateKey] && allDiaries[dateKey].length > 0; return <div key={day} className={`day-number ${hasEntry ? 'has-entry' : ''}`} onClick={() => handleDateClick(index, day)}>{String(day).padStart(2, '0')}</div>; })}</div></div>); })}</div></div></section>)}
      {currentStep === 'PLAYLIST' && (
        <section className="playlist-section animate-fade-in">
          <div className="playlist-container" style={{zIndex: 20}}>
            <div className="playlist-nav"><button className="nav-btn back-btn" onClick={backToDiary}><svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button><span className="nav-title" onClick={handleMonthTitleClick}>{months[playlistMonthIdx].toUpperCase()}</span><button className="nav-btn more-btn" onClick={togglePlaylist}>•••</button></div>
            <div className="player-main-content">
                {plSong ? 
                    <div className="current-art-container">
                        <img src={plSong.image} alt="Album" className="current-art shadow-lg grayscale" />
                    </div> 
                    : <div className="current-art-placeholder shadow-lg">No Music</div>
                }
            </div>
            <div className="song-info-large"><h2 className="song-title-large">{plSong ? plSong.title : 'No Music'}</h2><p className="artist-name-large">{plSong ? plSong.artist : '-'}</p></div>
            <div className="player-controls-area">
                <div className="progress-container" onClick={handlePlSeek} style={{ cursor: 'pointer' }}>
                    <div className="progress-bar"><div className="progress-current" style={{width: `${(plTime / plDuration) * 100}%`}}></div><div className="progress-knob" style={{left: `${(plTime / plDuration) * 100}%`}}></div></div>
                    <div className="time-info"><span>{formatTime(plTime)}</span><span>{formatRemainingTime(plDuration, plTime)}</span></div>
                </div>
                <div className="controls-container">
                    <button className="control-btn prev-btn"><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M19 20L9 12l10-8v16zM5 19V5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    <button className="play-pause-btn" onClick={() => setIsPlPlaying(!isPlPlaying)}>
                        {isPlPlaying ? 
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M6 4h4v16H6zM14 4h4v16h-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/></svg> : 
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 9-14 9V3z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/></svg>
                        }
                    </button>
                    <button className="control-btn next-btn" onClick={handlePlSongEnded}><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 4l10 8-10 8V4zM19 5v14" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                </div>
                <div className="volume-section" ref={volumeRef}><span className="vol-label">MIN</span><div className="volume-arc-wrapper"><div className="volume-dots">{[...Array(10)].map((_, i) => (<span key={i} className={`v-dot ${i <= (volume/10) ? 'active' : ''}`} style={{ transform: `translateX(-50%) rotate(${-45 + (i * 10)}deg) translateY(-120px)` }}></span>))}</div></div><span className="vol-label">MAX</span></div>
            </div>
          </div>
          
          <div className={`playlist-overlay ${showPlaylistOverlay ? 'open' : ''}`}>
             <div className="drawer-header" onClick={togglePlaylist}><div className="drawer-handle"></div></div>
             <div className="folder-stack">
                <div className="folder-item month-folder" onClick={handleMonthFolderClick} style={{zIndex: 100}}>
                    <div className="folder-tab black-tab">{months[playlistMonthIdx].toUpperCase()}</div>
                    <div className="folder-content"><span className="folder-song">Play All {months[playlistMonthIdx]} Songs</span></div>
                </div>
                {currentMonthFolderSongs.length === 0 ? <div className="empty-message" style={{marginTop: '20px', textAlign: 'center'}}>No songs in {months[playlistMonthIdx]}</div> : currentMonthFolderSongs.map((song, idx) => (
                    <div key={idx} className="folder-item day-folder" onClick={() => handlePlaylistFolderClick(song)} style={{zIndex: 99 - idx}}>
                        <div className={`folder-tab gray-tab ${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'center' : 'right'}`}>{song.date}</div>
                        <div className="folder-content"><span className="folder-song">{song.title}</span><span className="folder-artist">{song.artist}</span></div>
                    </div>
                ))}
             </div>
             <div className="drawer-bottom-label">PLAYLIST</div>
          </div>
        </section>
      )}
      
      {/* 4. EDITOR */}
      {currentStep === 'EDITOR' && (
        <section className="editor-section animate-fade-in">
          <div className="editor-nav"><button className="back-to-cal-btn" onClick={handleBackToCalendar}>← Save & Back</button><span className="editor-date-title">{selectedDateKey}</span></div>
          <div className="app-container" onClick={() => { setSelectedId(null); setIsMenuOpen(false); }}>
            
            <div className="diary-canvas" style={{ backgroundColor: bgColor }}>
              {diaryItems.filter(i => i.type !== 'PLAYLIST_TRACK').map((item) => (
                <DraggableItem 
                    key={item.id} item={item} isSelected={selectedId === item.id} onSelect={(id) => setSelectedId(id)} onDelete={deleteItem}
                    onPlayPause={handleWidgetPlayPause} isGlobalPlaying={isEdPlaying}
                    onNext={handleWidgetNext} onPrev={handleWidgetPrev} onShuffle={handleWidgetShuffle}
                    currentTime={edTime} duration={edDuration}
                    songsOnDate={songsOnDate}
                    onStopDrag={handleStopDrag}
                    onDeleteTrack={deleteTrack}
                />
              ))}
            </div>

            {selectedItem && (
                <div className="property-panel" onClick={(e) => e.stopPropagation()}>
                    {selectedItem.type !== 'RECEIPT' && selectedItem.type !== 'PLAYER_WIDGET' && (
                        <div className="prop-row"><label>W</label><input type="number" value={parseInt(selectedItem.width) || 0} onChange={(e) => updateItem('width', Number(e.target.value))} /><label>H</label><input type="number" value={parseInt(selectedItem.height) || 0} onChange={(e) => updateItem('height', Number(e.target.value))} /></div>
                    )}
                    
                    {(selectedItem.type === 'SHAPE' || selectedItem.type === 'IMAGE' || selectedItem.type === 'RECEIPT') && (
                        <div className="prop-row" style={{display:'flex', alignItems:'center'}}>
                            <label style={{marginRight:'5px'}}>Spin</label>
                            <input type="checkbox" checked={selectedItem.isSpinning || false} onChange={(e) => updateItem('isSpinning', e.target.checked)} style={{width:'20px', height:'20px', cursor:'pointer'}} />
                        </div>
                    )}

                    {(selectedItem.type === 'SHAPE' || selectedItem.type === 'IMAGE' || selectedItem.type === 'TEXT') && (<div className="prop-row"><label>R</label><input type="number" value={parseInt(selectedItem.borderRadius) || 0} onChange={(e) => updateItem('borderRadius', Number(e.target.value))} title="Radius" /></div>)}
                    {(selectedItem.type === 'SHAPE' || selectedItem.type === 'TEXT') && (<><div className="prop-row"><label>BG</label><input type="color" value={selectedItem.backgroundColor} onChange={(e) => updateItem('backgroundColor', e.target.value)} /></div><div className="prop-row"><label>Border</label><input type="number" value={selectedItem.borderWidth || 0} onChange={(e) => updateItem('borderWidth', Number(e.target.value))} style={{width:'40px'}} /><input type="color" value={selectedItem.borderColor || '#000000'} onChange={(e) => updateItem('borderColor', e.target.value)} /></div></>)}
                    
                    {(selectedItem.type === 'TEXT' || selectedItem.type === 'SONG_TITLE' || selectedItem.type === 'TIME_DISPLAY') && (
                        <>
                            {(selectedItem.type === 'TEXT' || selectedItem.type === 'SONG_TITLE') && (
                                <div className="prop-row"><label>Font</label><div className="font-picker"><button onClick={() => setShowFontList(!showFontList)}>{selectedItem.fontFamily || 'Arial'}</button>{showFontList && (<div className="font-list">{fontList.map(font => (<div key={font} className="font-item" style={{fontFamily: font}} onMouseEnter={() => handleFontHover(font)} onMouseLeave={handleFontLeave} onClick={() => handleFontClick(font)}>{font}</div>))}</div>)}</div></div>
                            )}
                            <div className="prop-row"><label>Size</label><input type="number" value={selectedItem.fontSize || 16} onChange={(e) => updateItem('fontSize', Number(e.target.value))} /></div>
                            <div className="prop-row"><label>Color</label><input type="color" value={selectedItem.color} onChange={(e) => updateItem('color', e.target.value)} /></div>
                            
                            {(selectedItem.type === 'TEXT' || selectedItem.type === 'SONG_TITLE') && (
                                <div className="prop-row" style={{flex: 1, marginLeft:'10px'}}>
                                    <label>Text</label>
                                    <input type="text" value={selectedItem.content} onChange={(e) => updateItem('content', e.target.value)} style={{width: '120px'}} />
                                </div>
                            )}
                        </>
                    )}

                    {selectedItem.type === 'RECEIPT' && (
                        <div className="prop-row" style={{display:'flex', alignItems:'center'}}>
                            <label style={{marginRight:'5px'}}>B&W</label>
                            <input type="checkbox" checked={selectedItem.isGrayscale || false} onChange={(e) => updateItem('isGrayscale', e.target.checked)} style={{width:'20px', height:'20px', cursor:'pointer'}} />
                        </div>
                    )}
                </div>
            )}
            <div className="fab-container" onClick={(e) => e.stopPropagation()}>
                {isMenuOpen && (
                    <div className="fab-menu">
                        <div className="fab-item"><span className="fab-label">Background</span><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} /></div>
                        
                        <div className="fab-item column">
                            <div className="search-header"><span className="fab-label">Music</span><div className="fab-search"><input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchMusic()} /><button onClick={searchMusic} className="go-btn">Go</button></div></div>
                            {searchResults.length > 0 && (<div className="fab-results">{searchResults.map(s => (
                                <div key={s.trackId} className="search-result-row">
                                    <img src={s.artworkUrl100} alt="art" />
                                    <div className="s-info"><div className="s-title">{s.trackName}</div><div className="s-artist">{s.artistName}</div></div>
                                    <button className="add-song-btn" onClick={() => addToDiary(s)}>+</button>
                                </div>
                            ))}</div>)}
                        </div>

                        <div className="fab-item" onClick={addShape}><span className="fab-label">Add Shape ■</span></div>
                        <div className="fab-item" onClick={handleAddText}><span className="fab-label">Add Text T</span></div>
                        <label className="fab-item"><span className="fab-label">Add Photo 📷</span><input type="file" hidden onChange={handleAddPhoto} /></label>
                        <div className="fab-item" onClick={addReceipt}><span className="fab-label">Add Receipt 🧾</span></div>
                    </div>
                )}
                <button className={`fab-main-btn ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>+</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
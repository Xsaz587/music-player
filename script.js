document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const loopBtn = document.getElementById('loop-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeControl = document.getElementById('volume-control');
    const playlistEl = document.getElementById('playlist');
    const songTitleEl = document.getElementById('song-title');
    const songArtistEl = document.getElementById('song-artist');
    const coverEl = document.getElementById('cover');
    const coverWrapper = document.querySelector('.cover-wrapper');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Состояние проигрывателя
    let currentTrackIndex = 0;
    let tracks = [];
    let isLoopEnabled = false;
    
    // Загрузка плейлиста
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            tracks = data;
            renderPlaylist();
            loadTrack(currentTrackIndex);
        })
        .catch(error => console.error('Ошибка загрузки плейлиста:', error));
    
    // Воспроизведение/пауза
    playBtn.addEventListener('click', togglePlay);
    
    // Следующий трек
    nextBtn.addEventListener('click', playNextTrack);
    
    // Предыдущий трек
    prevBtn.addEventListener('click', playPrevTrack);
    
    // Зацикливание
    loopBtn.addEventListener('click', toggleLoop);
    
    // Обновление прогресса
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Перемотка
    progressBar.addEventListener('input', seek);
    
    // Громкость
    volumeControl.addEventListener('input', setVolume);
    
    // Автопереход к следующему треку (если зацикливание выключено)
    audioPlayer.addEventListener('ended', () => {
        if (!isLoopEnabled) playNextTrack();
        else audioPlayer.play();
    });
    
    // Смена темы
    themeToggle.addEventListener('click', toggleTheme);
    
    // Функции
    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play()
                .then(() => {
                    playBtn.textContent = '⏸';
                    coverWrapper.classList.remove('paused');
                    coverWrapper.classList.add('playing');
                });
        } else {
            audioPlayer.pause();
            playBtn.textContent = '▶';
            coverWrapper.classList.remove('playing');
            coverWrapper.classList.add('paused');
        }
    }
    
    function loadTrack(index) {
        if (tracks.length === 0) return;
        
        const track = tracks[index];
        audioPlayer.src = `music/${track.file}`;
        songTitleEl.textContent = track.title;
        songArtistEl.textContent = track.artist;
        coverEl.src = track.cover || 'https://via.placeholder.com/300';
        
        // Сброс состояния анимации
        coverWrapper.classList.remove('playing', 'paused');
        void coverWrapper.offsetWidth; // Принудительный рефлоу
        
        if (!audioPlayer.paused) {
            coverWrapper.classList.add('playing');
        } else {
            coverWrapper.classList.add('paused');
        }
        
        audioPlayer.load();
        if (!audioPlayer.paused) audioPlayer.play();
        
        // Подсветка текущего трека
        const playlistItems = playlistEl.querySelectorAll('li');
        playlistItems.forEach(item => item.classList.remove('active'));
        playlistItems[index].classList.add('active');
    }
    
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
    }
    
    function playPrevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
    }
    
    function toggleLoop() {
        isLoopEnabled = !isLoopEnabled;
        audioPlayer.loop = isLoopEnabled;
        loopBtn.textContent = isLoopEnabled ? '🔁 (вкл)' : '🔁 (выкл)';
    }
    
    function updateProgress() {
        if (audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progress;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            durationEl.textContent = formatTime(audioPlayer.duration);
        }
    }
    
    function seek() {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }
    
    function setVolume() {
        audioPlayer.volume = volumeControl.value;
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    function renderPlaylist() {
        playlistEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = `${track.artist} - ${track.title}`;
            li.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
            });
            playlistEl.appendChild(li);
        });
    }
    
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? 'Светлая тема' : 'Темная тема';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    // Проверка сохранённой темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'Светлая тема';
    }
});

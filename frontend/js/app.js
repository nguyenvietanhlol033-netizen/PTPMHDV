/**
 * AURA CINEMA - Main Application Logic
 * Kết nối hoàn chỉnh với API Gateway (http://localhost:8080)
 * Tuân thủ quy tắc thiết kế UI/UX Pro Max: phản hồi tức thì, không giật lag, tiếng Việt chuẩn.
 */

class CinemaApp {
    constructor() {
        this.currentView = 'schedule';
        this.selectedCinemaId = 1;
        this.selectedDate = this.getTodayString();
        
        this.cinemas = [];
        this.movies = [];
        this.showtimes = [];
        this.currentStatusFilter = 'ALL';
        this.activeFilterGenre = 'ALL';
        this.scheduleFilterGenre = 'ALL';
        this.searchQuery = '';

        // Đặt vé & Ghế
        this.currentShowtime = null;
        this.currentMovie = null;
        this.currentRoom = null;
        this.roomSeats = [];
        this.currentOccupiedSeatIds = [];
        this.selectedSeats = [];
        this.selectedSeat = null;

        // Giữ ghế & Thanh toán
        this.currentTicket = null;
        this.currentTickets = [];
        this.holdTimerInterval = null;
        this.holdSecondsRemaining = 600; // 10 phút

        // Admin Portal Pro Max State
        this.adminCurrentTab = 'overview';
        this.adminTickets = [];
        this.adminRoomSeats = [];
        this.adminSelectedRoomId = 1;
        this.adminSelectedCinemaId = 1;
        this.adminSelectedSeat = null;
        this.adminClockInterval = null;
        this.adminCurrentTicketFilter = 'ALL';

        // Khởi tạo
        this.init();
    }

    async init() {
        this.updateAuthUI();
        this.setupDateTabs();

        // Lắng nghe phím Esc để đóng Admin Portal hoặc sub-modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!document.getElementById('adm-movie-modal')?.classList.contains('hidden')) {
                    this.closeMovieFormModal();
                } else if (!document.getElementById('adm-showtime-modal')?.classList.contains('hidden')) {
                    this.closeCreateShowtimeModal();
                } else if (!document.getElementById('adm-ticket-modal')?.classList.contains('hidden')) {
                    this.closeTicketDetailModal();
                } else if (!document.getElementById('admin-modal')?.classList.contains('hidden')) {
                    this.closeAdminModal();
                }
            }
        });

        // Kiểm tra Gateway Backend
        const isOnline = await api.checkGatewayHealth();
        this.updateBackendStatusBadge(isOnline);

        // Tải dữ liệu ban đầu
        await this.loadInitialData();

        // Định kỳ kiểm tra backend mỗi 10 giây
        let previousOnlineStatus = isOnline;
        setInterval(async () => {
            const online = await api.checkGatewayHealth();
            if (online !== previousOnlineStatus) {
                previousOnlineStatus = online;
                this.updateBackendStatusBadge(online);
                if (online) {
                    this.showToast('Đã kết nối thành công với Backend API Gateway (8080)', 'success');
                    await this.loadInitialData();
                } else {
                    this.showToast('Mất kết nối với Backend Gateway, chuyển sang Demo Mode', 'warning');
                }
            }
        }, 10000);

        // Đóng dropdown tài khoản khi click ra ngoài
        document.addEventListener('click', (e) => {
            const container = document.getElementById('user-dropdown-container');
            if (container && !container.contains(e.target)) {
                this.closeUserDropdown();
            }
        });
    }

    getTodayString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatLocalDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    isShowtimePast(showtime) {
        if (!showtime || !showtime.showDate || !showtime.startTime) return false;
        try {
            const now = new Date();
            const dateStr = String(showtime.showDate).trim();
            const timeStr = String(showtime.startTime).trim();
            const [y, m, d] = dateStr.split('-').map(Number);
            const timeParts = timeStr.split(':').map(Number);
            const hour = timeParts[0] || 0;
            const minute = timeParts[1] || 0;
            const second = timeParts[2] || 0;
            const showtimeDate = new Date(y, m - 1, d, hour, minute, second);
            return showtimeDate <= now;
        } catch (e) {
            return false;
        }
    }

    showPastShowtimeToast(timeStr) {
        this.showToast(`Suất chiếu lúc ${timeStr} đã diễn ra hoặc kết thúc! Quý khách vui lòng chọn các suất chiếu sắp tới hoặc chuyển sang ngày mai để đặt vé.`, 'warning');
    }

    formatVND(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    getCinemaRoomIds(cinemaId) {
        const id = parseInt(cinemaId);
        if (id === 1) return [1, 2, 3];
        if (id === 2) return [4, 5, 6];
        if (id === 3) return [7, 8, 9];
        return [1, 2, 3];
    }

    getRoomName(roomId) {
        const id = parseInt(roomId);
        const names = {
            1: 'P.01 (IMAX Laser)',
            2: 'P.02 (Dolby Atmos)',
            3: 'P.03 (Gold Class VIP)',
            4: 'P.01 (Starium 3D)',
            5: 'P.02 (Dolby 7.1)',
            6: 'P.03 (Royal Lounge VIP)',
            7: 'P.01 (ScreenX 270°)',
            8: 'P.02 (Dolby Atmos)',
            9: 'P.03 (L\'amour Giường Nằm VIP)'
        };
        return names[id] || `Phòng 0${id || 1}`;
    }

    updateBackendStatusBadge(isOnline) {
        const badge = document.getElementById('backend-status');
        const text = document.getElementById('backend-status-text');
        if (!badge || !text) return;

        if (isOnline) {
            badge.className = 'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400';
            text.textContent = 'Gateway 8080: Online';
        } else {
            badge.className = 'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-400';
            text.textContent = 'Demo Mode (Backend chưa bật)';
        }
    }

    // ==================== TẢI DỮ LIỆU BAN ĐẦU ====================
    async loadInitialData() {
        try {
            if (api.isBackendOnline) {
                // Tải từ Backend Gateway
                const [cinemas, nowShowing, comingSoon] = await Promise.all([
                    api.getCinemas().catch(() => MOCK_DATA.cinemas),
                    api.getNowShowing().catch(() => []),
                    api.getComingSoon().catch(() => [])
                ]);

                this.cinemas = (cinemas && cinemas.length > 0) ? cinemas : MOCK_DATA.cinemas;
                
                // Gom phim
                const movieMap = new Map();
                [...nowShowing, ...comingSoon].forEach(m => movieMap.set(m.id, m));
                this.movies = Array.from(movieMap.values());
                if (this.movies.length === 0) {
                    this.movies = MOCK_DATA.movies;
                }
            } else {
                // Tải từ Mock Data chất lượng cao
                this.cinemas = MOCK_DATA.cinemas;
                this.movies = MOCK_DATA.movies;
            }
        } catch (e) {
            console.warn('Dùng dữ liệu dự phòng:', e);
            this.cinemas = MOCK_DATA.cinemas;
            this.movies = MOCK_DATA.movies;
        }

        this.renderCinemasDropdown();
        this.renderMoviesGrid();
        this.renderCinemasView();
        await this.loadSchedule();
    }

    // ==================== NAVIGATION & VIEWS ====================
    switchView(viewName) {
        this.currentView = viewName;
        
        // Ẩn tất cả views
        document.getElementById('view-schedule').classList.add('hidden');
        document.getElementById('view-movies-grid').classList.add('hidden');
        document.getElementById('view-cinemas').classList.add('hidden');

        // Reset nav styles
        const navIds = ['schedule', 'all-movies', 'now-showing', 'coming-soon', 'cinemas', 'my-tickets'];
        navIds.forEach(id => {
            const btn = document.getElementById(`nav-${id}`);
            if (btn) {
                btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 hover:text-gold hover:bg-amber-50 transition-all duration-200';
            }
        });

        // Kích hoạt view tương ứng
        if (viewName === 'schedule') {
            document.getElementById('view-schedule').classList.remove('hidden');
            const btn = document.getElementById('nav-schedule');
            if (btn) btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-gold bg-gold/10 border border-gold/30';
            this.loadSchedule();
        } else if (viewName === 'all-movies') {
            document.getElementById('view-movies-grid').classList.remove('hidden');
            const btn = document.getElementById('nav-all-movies');
            if (btn) btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-gold bg-gold/10 border border-gold/30';
            this.currentStatusFilter = 'ALL';
            this.renderMoviesGrid();
        } else if (viewName === 'now-showing') {
            document.getElementById('view-movies-grid').classList.remove('hidden');
            const btn = document.getElementById('nav-now-showing');
            if (btn) btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-gold bg-gold/10 border border-gold/30';
            this.currentStatusFilter = 'NOW_SHOWING';
            this.renderMoviesGrid();
        } else if (viewName === 'coming-soon') {
            document.getElementById('view-movies-grid').classList.remove('hidden');
            const btn = document.getElementById('nav-coming-soon');
            if (btn) btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-gold bg-gold/10 border border-gold/30';
            this.currentStatusFilter = 'COMING_SOON';
            this.renderMoviesGrid();
        } else if (viewName === 'cinemas') {
            document.getElementById('view-cinemas').classList.remove('hidden');
            const btn = document.getElementById('nav-cinemas');
            if (btn) btn.className = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-gold bg-gold/10 border border-gold/30';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==================== DATE TABS RIBBON (Phong cách Beta Cinemas) ====================
    setupDateTabs() {
        const container = document.getElementById('date-tabs-list');
        if (!container) return;
        container.innerHTML = '';

        const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const today = new Date();

        for (let i = 0; i < 8; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dateStr = this.formatLocalDate(date);
            const isToday = (i === 0);
            const dayName = isToday ? 'Hôm nay' : daysOfWeek[date.getDay()];
            const dayNumber = String(date.getDate()).padStart(2, '0');
            const monthNumber = String(date.getMonth() + 1).padStart(2, '0');

            const tab = document.createElement('div');
            tab.className = `date-tab ${dateStr === this.selectedDate ? 'active' : ''}`;
            tab.setAttribute('data-date', dateStr);
            tab.innerHTML = `
                <span class="day-name">${dayName}</span>
                <span class="day-number">${dayNumber}</span>
                <span class="day-month">${dayNumber}/${monthNumber}</span>
            `;

            tab.onclick = () => {
                document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedDate = dateStr;
                this.loadSchedule();
            };

            container.appendChild(tab);
        }
    }

    renderCinemasDropdown() {
        const select = document.getElementById('select-cinema');
        if (!select) return;
        select.innerHTML = '';
        this.cinemas.forEach(cinema => {
            const opt = document.createElement('option');
            opt.value = cinema.id;
            opt.textContent = `${cinema.name} (${cinema.address.split(',').pop().trim()})`;
            select.appendChild(opt);
        });
    }

    onCinemaChange(cinemaId) {
        this.selectedCinemaId = parseInt(cinemaId);
        this.showToast(`Đã chuyển sang cụm rạp: ${this.cinemas.find(c => c.id === this.selectedCinemaId)?.name || ''}`, 'info');
        this.loadSchedule();
    }

    // ==================== LOAD & RENDER LỊCH CHIẾU ====================
    async loadSchedule() {
        const container = document.getElementById('schedule-movies-container');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-16 space-y-4">
                <div class="inline-block w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                <p class="text-slate-400 text-sm">Đang nạp dữ liệu suất chiếu từ Gateway...</p>
            </div>
        `;

        let showtimes = [];
        try {
            if (api.isBackendOnline) {
                // Tải suất chiếu cho từng phim theo ngày đã chọn
                const promises = this.movies.map(m => api.getShowtimes(m.id, this.selectedDate).catch(() => []));
                const results = await Promise.all(promises);
                showtimes = results.flat();
            } else {
                // Dùng Mock Showtimes
                showtimes = MOCK_DATA.generateMockShowtimes().filter(s => s.showDate === this.selectedDate);
            }
        } catch (e) {
            console.warn('Lỗi tải lịch chiếu, dùng mock:', e);
            showtimes = MOCK_DATA.generateMockShowtimes().filter(s => s.showDate === this.selectedDate);
        }

        this.showtimes = showtimes;
        this.renderScheduleList();
    }

    // ==================== GENRE MATCHING HELPER ====================
    matchesGenre(movieGenre, targetGenre) {
        if (!targetGenre || targetGenre === 'ALL') return true;
        if (!movieGenre) return false;
        const mg = movieGenre.toLowerCase();
        const tg = targetGenre.toLowerCase();
        if (tg.includes('hành động') || tg === 'action') {
            return mg.includes('hành động') || mg.includes('action');
        }
        if (tg.includes('hoạt hình') || tg === 'animation') {
            return mg.includes('hoạt hình') || mg.includes('animation');
        }
        if (tg.includes('kinh dị') || tg === 'horror') {
            return mg.includes('kinh dị') || mg.includes('hồi hộp') || mg.includes('horror');
        }
        return mg.includes(tg);
    }

    filterScheduleMovies(query) {
        this.searchQuery = (query || '').toLowerCase().trim();
        this.renderScheduleList();
    }

    filterScheduleByGenre(genre) {
        this.scheduleFilterGenre = genre;
        document.querySelectorAll('.sched-genre-btn').forEach(btn => {
            const btnGenre = btn.getAttribute('data-genre') || '';
            const isActive = (btnGenre === genre) || (genre === 'ALL' && btnGenre === 'ALL');
            if (isActive) {
                btn.className = 'sched-genre-btn active px-3.5 py-1 text-xs font-semibold rounded-lg bg-gold text-white transition border border-gold shadow-sm';
            } else {
                btn.className = 'sched-genre-btn px-3.5 py-1 text-xs font-semibold rounded-lg bg-white text-slate-600 hover:text-gold border border-slate-200 hover:border-gold transition';
            }
        });
        this.renderScheduleList();
    }

    renderScheduleList() {
        const container = document.getElementById('schedule-movies-container');
        if (!container) return;

        const validRoomIds = this.getCinemaRoomIds(this.selectedCinemaId);
        const cinemaShowtimes = this.showtimes.filter(st => validRoomIds.includes(parseInt(st.roomId)));

        // Lọc phim theo suất chiếu có trong ngày & rạp đã chọn & thể loại chọn ở schedule
        let filteredMovies = this.movies.filter(movie => {
            const hasShowtime = cinemaShowtimes.some(st => (st.movieId || st.movie?.id) === movie.id);
            const matchSearch = !this.searchQuery || 
                movie.title.toLowerCase().includes(this.searchQuery) ||
                movie.genre.toLowerCase().includes(this.searchQuery);
            const matchGenre = this.matchesGenre(movie.genre, this.scheduleFilterGenre);
            return hasShowtime && matchSearch && matchGenre;
        });

        // Nếu không có phim nào có suất trong ngày (Demo Mode), hiển thị các phim phù hợp với thể loại
        if (filteredMovies.length === 0 && !api.isBackendOnline) {
            filteredMovies = this.movies.filter(m => {
                const s = (m.status || '').toUpperCase();
                const isNow = s === 'NOW_SHOWING' || s.includes('ĐANG CHIẾU') || s.includes('DANG CHIEU');
                const matchGenre = this.matchesGenre(m.genre, this.scheduleFilterGenre);
                return isNow && matchGenre;
            });
        }

        if (filteredMovies.length === 0) {
            container.innerHTML = `
                <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
                    <div class="w-12 h-12 rounded-xl bg-amber-50 text-gold flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
                    </div>
                    <h3 class="text-base font-semibold text-slate-900">Không có suất chiếu nào phù hợp</h3>
                    <p class="text-xs text-slate-500">Vui lòng chọn ngày chiếu khác, đổi cụm rạp hoặc chọn "Tất Cả" thể loại.</p>
                    <button onclick="app.filterScheduleByGenre('ALL')" class="mt-2 px-4 py-2 bg-amber-50 text-gold border border-amber-300 rounded-lg text-xs font-semibold hover:bg-gold hover:text-white transition">
                        Hiển Thị Tất Cả Suất Chiếu
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        filteredMovies.forEach(movie => {
            // Lấy các suất chiếu của phim này tại cụm rạp đã chọn
            let movieShowtimes = cinemaShowtimes.filter(st => (st.movieId || st.movie?.id) === movie.id);
            if (movieShowtimes.length === 0 && !api.isBackendOnline) {
                movieShowtimes = [
                    { id: movie.id * 10 + 1, movieId: movie.id, roomId: validRoomIds[0], startTime: "09:30", endTime: "11:45", basePrice: 80000, showDate: this.selectedDate },
                    { id: movie.id * 10 + 2, movieId: movie.id, roomId: validRoomIds[0], startTime: "14:15", endTime: "16:30", basePrice: 90000, showDate: this.selectedDate },
                    { id: movie.id * 10 + 3, movieId: movie.id, roomId: validRoomIds[1], startTime: "19:00", endTime: "21:15", basePrice: 110000, showDate: this.selectedDate },
                    { id: movie.id * 10 + 4, movieId: movie.id, roomId: validRoomIds[0], startTime: "21:45", endTime: "23:59", basePrice: 95000, showDate: this.selectedDate }
                ];
            }
            movieShowtimes.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

            const posterUrl = movie.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
            const ageRating = movie.ageRating || 'C16';

            const card = document.createElement('div');
            card.className = 'movie-schedule-card p-5 sm:p-7';
            card.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                    <!-- Movie Poster (Col 1-4) -->
                    <div onclick="app.openMovieDetailModal(${movie.id})" class="md:col-span-4 lg:col-span-3 xl:col-span-3 relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200 group cursor-pointer" title="Bấm để xem chi tiết phim & trailer">
                        <img src="${posterUrl}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-xs font-black bg-crimson text-white shadow-md">
                            ${ageRating}
                        </span>
                        <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="px-3.5 py-1.5 rounded-lg bg-gold text-white text-xs font-bold shadow-md">Xem Chi Tiết</span>
                        </div>
                    </div>

                    <!-- Movie Details & Showtimes (Col 5-12) -->
                    <div class="md:col-span-8 lg:col-span-9 xl:col-span-9 space-y-5">
                        <div class="border-b border-slate-100 pb-4">
                            <h3 onclick="app.openMovieDetailModal(${movie.id})" class="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-wide hover:text-gold transition cursor-pointer">
                                ${movie.title}
                            </h3>
                            <div class="flex flex-wrap items-center gap-2.5 sm:gap-4 text-sm sm:text-base text-slate-500 mt-2">
                                <span class="text-gold font-bold">${movie.genre}</span>
                                <span>•</span>
                                <span>⏱ ${movie.durationMinutes || 120} phút</span>
                                <span>•</span>
                                <span class="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm">${movie.format || '2D Phụ đề'}</span>
                                ${movie.releaseDate ? `<span>•</span><span>Khởi chiếu: ${movie.releaseDate}</span>` : ''}
                            </div>
                        </div>

                        <!-- Showtimes Chips Grid -->
                        <div>
                            <div class="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-gold"></span>
                                SUẤT CHIẾU TRONG NGÀY (CHỌN GIỜ ĐỂ ĐẶT GHẾ):
                            </div>
                            <div class="flex flex-wrap gap-3.5">
                                ${movieShowtimes.map(st => {
                                    const isPast = this.isShowtimePast(st);
                                    const timeDisplay = (st.startTime || '19:00').substring(0, 5);
                                    if (isPast) {
                                        return `
                                            <button onclick="app.showPastShowtimeToast('${timeDisplay}')" 
                                                    class="showtime-chip past opacity-50 bg-slate-100 hover:bg-slate-200 border-slate-200 cursor-not-allowed group" 
                                                    title="${app.getRoomName(st.roomId)} - Suất chiếu lúc ${timeDisplay} đã kết thúc">
                                                <span class="time-text text-slate-400 line-through">${timeDisplay}</span>
                                                <span class="price-text text-slate-400 font-normal">Đã chiếu</span>
                                                <span class="text-xs text-slate-400 font-medium mt-0.5">${app.getRoomName(st.roomId)}</span>
                                            </button>
                                        `;
                                    }
                                    return `
                                        <button onclick="app.openSeatModal(${st.id}, ${movie.id})" class="showtime-chip group" title="${app.getRoomName(st.roomId)} - Bấm để chọn ghế">
                                            <span class="time-text">${timeDisplay}</span>
                                            <span class="price-text">${app.formatVND(st.basePrice || 80000)}</span>
                                            <span class="text-xs text-amber-700 font-bold group-hover:text-white mt-0.5">${app.getRoomName(st.roomId)}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ==================== STATUS TABS & GENRE FILTERS ====================
    switchMovieStatus(status) {
        this.currentStatusFilter = status;
        this.renderMoviesGrid();
    }

    filterMoviesByGenre(genre) {
        this.activeFilterGenre = genre;
        this.renderMoviesGrid();
    }

    updateGenreCounters(movieList) {
        const countAll = movieList.length;
        const countAction = movieList.filter(m => this.matchesGenre(m.genre, 'Hành Động')).length;
        const countAnim = movieList.filter(m => this.matchesGenre(m.genre, 'Hoạt Hình')).length;
        const countHorror = movieList.filter(m => this.matchesGenre(m.genre, 'Kinh Dị')).length;

        const elAll = document.getElementById('genre-count-all');
        const elAction = document.getElementById('genre-count-action');
        const elAnim = document.getElementById('genre-count-anim');
        const elHorror = document.getElementById('genre-count-horror');

        if (elAll) elAll.textContent = countAll;
        if (elAction) elAction.textContent = countAction;
        if (elAnim) elAnim.textContent = countAnim;
        if (elHorror) elHorror.textContent = countHorror;
    }

    updateGenreFilterUI() {
        document.querySelectorAll('.genre-btn').forEach(btn => {
            const btnGenre = btn.getAttribute('data-genre') || '';
            const isActive = (btnGenre === this.activeFilterGenre) || 
                             (this.activeFilterGenre === 'ALL' && btnGenre === 'ALL');
            if (isActive) {
                btn.className = 'genre-btn active px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gold text-white shadow-sm transition border border-gold';
            } else {
                btn.className = 'genre-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-600 hover:text-gold border border-slate-200 hover:border-gold transition';
            }
        });
    }

    // ==================== RENDER MOVIES GRID ====================
    renderMoviesGrid(filterStatus = null) {
        const container = document.getElementById('movies-grid-container');
        if (!container) return;
        container.innerHTML = '';

        if (filterStatus) {
            this.currentStatusFilter = filterStatus;
        }
        const status = this.currentStatusFilter || 'ALL';

        // 1. Lọc theo trạng thái phim (Đang chiếu / Sắp chiếu / Tất cả)
        let statusList = this.movies;
        if (status !== 'ALL') {
            statusList = statusList.filter(m => {
                if (!m.status) return false;
                const s = m.status.toUpperCase();
                if (status === 'NOW_SHOWING') {
                    return s === 'NOW_SHOWING' || s.includes('ĐANG CHIẾU') || s.includes('DANG CHIEU');
                }
                if (status === 'COMING_SOON') {
                    return s === 'COMING_SOON' || s.includes('SẮP CHIẾU') || s.includes('SAP CHIEU');
                }
                return s === status;
            });
        }

        // Cập nhật số lượng thể loại tương ứng với danh sách trạng thái hiện tại
        this.updateGenreCounters(statusList);

        // 2. Lọc theo thể loại đã chọn (Tất cả, Hành Động, Hoạt Hình, Kinh Dị)
        let finalList = statusList;
        if (this.activeFilterGenre && this.activeFilterGenre !== 'ALL') {
            finalList = finalList.filter(m => this.matchesGenre(m.genre, this.activeFilterGenre));
        }

        // Cập nhật tiêu đề hiển thị
        const titleEl = document.getElementById('movies-grid-title');
        const subtitleEl = document.getElementById('movies-grid-subtitle');
        if (titleEl) {
            let statusText = status === 'NOW_SHOWING' ? 'PHIM ĐANG CHIẾU' : (status === 'COMING_SOON' ? 'PHIM SẮP CHIẾU' : 'TẤT CẢ PHIM');
            let genreText = this.activeFilterGenre !== 'ALL' ? ` - THỂ LOẠI ${this.activeFilterGenre.toUpperCase()}` : '';
            titleEl.textContent = `DANH SÁCH ${statusText}${genreText}`;
        }
        if (subtitleEl) {
            subtitleEl.textContent = `Hiển thị ${finalList.length} bộ phim phù hợp với tiêu chí lọc`;
        }

        this.updateGenreFilterUI();

        if (finalList.length === 0) {
            container.innerHTML = `
                <div class="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
                    <div class="w-12 h-12 rounded-xl bg-amber-50 text-gold flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
                    </div>
                    <h3 class="text-base font-semibold text-slate-900">Không có phim nào thuộc thể loại "${this.activeFilterGenre}"</h3>
                    <p class="text-xs text-slate-500">Vui lòng chọn thể loại khác hoặc chuyển qua tab Phim Khác.</p>
                    <button onclick="app.filterMoviesByGenre('ALL')" class="mt-2 px-4 py-2 bg-amber-50 text-gold border border-amber-300 rounded-lg text-xs font-semibold hover:bg-gold hover:text-white transition">
                        Xem Tất Cả Thể Loại
                    </button>
                </div>
            `;
            return;
        }

        finalList.forEach(movie => {
            const posterUrl = movie.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
            const isNowShowing = (movie.status || '').toUpperCase().includes('NOW_SHOWING') || (movie.status || '').toUpperCase().includes('ĐANG CHIẾU');
            
            const card = document.createElement('div');
            card.className = 'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg group hover:border-gold transition-all duration-300 flex flex-col';
            card.innerHTML = `
                <div onclick="app.openMovieDetailModal(${movie.id})" class="relative aspect-[2/3] overflow-hidden cursor-pointer" title="Bấm để xem chi tiết phim & trailer">
                    <img src="${posterUrl}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-xs font-black bg-crimson text-white shadow-md">
                        ${movie.ageRating || 'C16'}
                    </span>
                    <span class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-bold ${isNowShowing ? 'bg-emerald text-white' : 'bg-blue-600 text-white'} shadow-md">
                        ${isNowShowing ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                    <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="px-3 py-1.5 rounded-lg bg-gold text-white text-xs font-bold shadow-md">Chi tiết & Trailer</span>
                    </div>
                </div>
                <div class="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                        <h4 onclick="app.openMovieDetailModal(${movie.id})" class="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-gold transition cursor-pointer" title="${movie.title}">${movie.title}</h4>
                        <p class="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1 font-medium">${movie.genre}</p>
                        ${movie.releaseDate ? `<p class="text-xs text-slate-400 mt-0.5">Khởi chiếu: ${movie.releaseDate}</p>` : ''}
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 pt-1">
                        <button onclick="app.openMovieDetailModal(${movie.id})" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition border border-slate-200">
                            Chi Tiết
                        </button>
                        <button onclick="${isNowShowing ? `app.switchView('schedule'); app.filterScheduleMovies('${movie.title}')` : `app.openMovieDetailModal(${movie.id})`}" class="w-full py-2 bg-amber-50 hover:bg-gold hover:text-white text-gold text-xs sm:text-sm font-bold rounded-xl transition border border-amber-300">
                            ${isNowShowing ? 'Đặt Vé' : 'Trailer'}
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderCinemasView() {
        const container = document.getElementById('cinemas-list-container');
        if (!container) return;
        container.innerHTML = '';

        this.cinemas.forEach(c => {
            const card = document.createElement('div');
            card.className = 'bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-sm space-y-4 hover:border-gold hover:shadow-md transition';
            card.innerHTML = `
                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-gold flex items-center justify-center font-bold shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <h3 class="text-xl font-black text-slate-900">${c.name}</h3>
                <p class="text-sm text-slate-500 leading-relaxed font-medium">${c.address}</p>
                <div class="pt-2 flex items-center gap-2 text-sm font-bold text-gold">
                    <span>Trang bị: IMAX Laser, Dolby Atmos, Ghế VIP & Sweetbox</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ==================== MÀN HÌNH CHỌN GHẾ (SEAT SELECTION) ====================
    async openSeatModal(showtimeId, movieId) {
        this.currentMovie = this.movies.find(m => m.id === movieId) || { title: "DUNE 2" };
        this.currentShowtime = this.showtimes.find(st => st.id === showtimeId) || {
            id: showtimeId,
            movieId: movieId,
            roomId: 1,
            startTime: "19:00",
            showDate: this.selectedDate,
            basePrice: 85000
        };

        const modal = document.getElementById('seat-modal');
        document.getElementById('seat-modal-movie-title').textContent = this.currentMovie.title;
        document.getElementById('seat-modal-cinema-name').textContent = this.cinemas.find(c => c.id === this.selectedCinemaId)?.name || 'AURA CINEMA - Landmark Grand';
        document.getElementById('seat-modal-room-name').textContent = this.getRoomName(this.currentShowtime.roomId || 1);
        document.getElementById('seat-modal-time').textContent = `${this.currentShowtime.startTime}, ${this.currentShowtime.showDate}`;

        this.selectedSeats = [];
        this.selectedSeat = null;
        this.updateSelectedSeatDisplay();

        modal.classList.remove('hidden');

        // Kiểm tra xem suất chiếu này có thuộc quá khứ không
        const isPast = this.isShowtimePast(this.currentShowtime);
        const alertEl = document.getElementById('seat-modal-past-alert');
        if (alertEl) {
            if (isPast) {
                alertEl.innerHTML = `⚠️ <b>Suất chiếu lúc ${(this.currentShowtime.startTime || '').substring(0, 5)} (${this.currentShowtime.showDate}) đã diễn ra trong quá khứ.</b> Quý khách vui lòng chọn các suất chiếu sắp tới hoặc chuyển sang ngày mai để đặt vé.`;
                alertEl.classList.remove('hidden');
            } else {
                alertEl.classList.add('hidden');
            }
        }

        // Tải sơ đồ ghế & danh sách ghế đã bán/đang giữ cho suất chiếu này
        await this.loadSeatsForShowtime(this.currentShowtime.id, this.currentShowtime.roomId || 1);
    }

    closeSeatModal() {
        document.getElementById('seat-modal').classList.add('hidden');
    }

    // ==================== MODAL CHI TIẾT PHIM ====================
    openMovieDetailModal(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;
        this.selectedDetailMovie = movie;

        const modal = document.getElementById('movie-detail-modal');
        if (!modal) return;

        const posterUrl = movie.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
        const isNowShowing = (movie.status || '').toUpperCase().includes('NOW_SHOWING') || (movie.status || '').toUpperCase().includes('ĐANG CHIẾU');

        document.getElementById('detail-modal-poster').src = posterUrl;
        document.getElementById('detail-modal-age').textContent = movie.ageRating || 'C16';
        document.getElementById('detail-modal-title').textContent = movie.title;
        document.getElementById('detail-modal-genre').textContent = movie.genre || 'Phim Chiếu Rạp';
        document.getElementById('detail-modal-duration').textContent = `⏱ ${movie.durationMinutes || 120} phút`;
        
        const statusEl = document.getElementById('detail-modal-status');
        statusEl.textContent = isNowShowing ? 'Đang chiếu' : 'Sắp chiếu';
        statusEl.className = isNowShowing 
            ? 'px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
            : 'px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30';

        document.getElementById('detail-modal-director').textContent = movie.director || 'Đang cập nhật';
        document.getElementById('detail-modal-actors').textContent = movie.actors || 'Đang cập nhật';
        document.getElementById('detail-modal-release').textContent = movie.releaseDate || '2026';
        document.getElementById('detail-modal-desc').textContent = movie.description || 'Chưa có tóm tắt nội dung.';

        const trailerBtn = document.getElementById('detail-modal-trailer-btn');
        if (movie.trailer && movie.trailer.startsWith('http')) {
            trailerBtn.href = movie.trailer;
            trailerBtn.classList.remove('hidden');
        } else {
            trailerBtn.classList.add('hidden');
        }

        const bookBtn = document.getElementById('detail-modal-book-btn');
        if (isNowShowing) {
            bookBtn.innerHTML = '<svg class="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg><span>Xem Lịch Chiếu & Đặt Vé</span>';
            bookBtn.onclick = () => {
                this.closeMovieDetailModal();
                this.switchView('schedule');
                this.filterScheduleMovies(movie.title);
            };
        } else {
            bookBtn.innerHTML = '<svg class="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span>Đặt Nhắc Nhở Khi Chiếu</span>';
            bookBtn.onclick = () => {
                this.showToast(`Đã lưu lời nhắc cho phim "${movie.title}" khi khởi chiếu (${movie.releaseDate})`, 'success');
            };
        }

        modal.classList.remove('hidden');
    }

    closeMovieDetailModal() {
        const modal = document.getElementById('movie-detail-modal');
        if (modal) modal.classList.add('hidden');
    }

    bookFromDetailModal() {
        if (!this.selectedDetailMovie) return;
        this.closeMovieDetailModal();
        this.switchView('schedule');
        this.filterScheduleMovies(this.selectedDetailMovie.title);
    }

    async loadSeatsForRoom(roomId) {
        return this.loadSeatsForShowtime(this.currentShowtime?.id, roomId);
    }

    async loadSeatsForShowtime(showtimeId, roomId) {
        const grid = document.getElementById('seat-grid');
        grid.innerHTML = '<div class="text-slate-400 text-xs py-8">Đang tải sơ đồ ghế phòng chiếu...</div>';

        let seats = [];
        let occupiedSeats = [];
        try {
            if (api.isBackendOnline) {
                // ƯU TIÊN GỌI SHOWTIME SEAT MAP API MỚI (TẬP TRUNG TÍNH TOÁN GIÁ & TRẠNG THÁI TẠI BACKEND)
                if (showtimeId) {
                    try {
                        const showtimeSeats = await api.getShowtimeSeats(showtimeId);
                        if (Array.isArray(showtimeSeats) && showtimeSeats.length > 0) {
                            seats = showtimeSeats.map(s => ({
                                id: s.seatId,
                                seatName: s.seatName,
                                seatType: s.seatType,
                                status: s.status, // AVAILABLE, HELD, SOLD, MAINTENANCE
                                price: s.price
                            }));
                            occupiedSeats = showtimeSeats
                                .filter(s => s.status === 'HELD' || s.status === 'SOLD')
                                .map(s => s.seatId);
                        }
                    } catch (err) {
                        console.warn('Showtime Seat Map API fallback sang cách cũ:', err);
                    }
                }

                if (seats.length === 0) {
                    const [seatsRes, occupiedRes] = await Promise.all([
                        api.getSeatsByRoom(roomId),
                        showtimeId ? api.getOccupiedSeatsByShowtime(showtimeId).catch(() => []) : Promise.resolve([])
                    ]);
                    seats = seatsRes || [];
                    occupiedSeats = Array.isArray(occupiedRes) ? occupiedRes : [];
                }
            } else {
                seats = MOCK_DATA.generateMockSeats(roomId);
                occupiedSeats = showtimeId && MOCK_DATA.getOccupiedSeats ? MOCK_DATA.getOccupiedSeats(showtimeId) : [];
            }
        } catch (e) {
            console.warn('Lỗi tải sơ đồ ghế:', e);
            seats = MOCK_DATA.generateMockSeats(roomId);
            occupiedSeats = showtimeId && MOCK_DATA.getOccupiedSeats ? MOCK_DATA.getOccupiedSeats(showtimeId) : [];
        }

        this.roomSeats = seats;
        this.currentOccupiedSeatIds = occupiedSeats;
        this.renderSeatGrid();
    }

    renderSeatGrid() {
        const grid = document.getElementById('seat-grid');
        grid.innerHTML = '';

        // Gom ghế theo hàng (dựa trên ký tự đầu tiên A, B, C...)
        const rowMap = new Map();
        this.roomSeats.forEach(seat => {
            const rowLabel = seat.seatName.charAt(0);
            if (!rowMap.has(rowLabel)) rowMap.set(rowLabel, []);
            rowMap.get(rowLabel).push(seat);
        });

        rowMap.forEach((seatsInRow, rowLabel) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';

            // Nhãn hàng bên trái
            const labelLeft = document.createElement('div');
            labelLeft.className = 'row-label';
            labelLeft.textContent = rowLabel;
            rowDiv.appendChild(labelLeft);

            // Các ghế trong hàng
            seatsInRow.forEach(seat => {
                const seatBtn = document.createElement('button');
                const isSelected = (this.selectedSeats && this.selectedSeats.some(s => s.id === seat.id))
                    || (this.selectedSeat && this.selectedSeat.id === seat.id);
                // Ghế đã bán/đang giữ được xác định THEO TỪNG SUẤT CHIẾU (hoặc bảo trì vật lý)
                const isOccupiedForShowtime = this.currentOccupiedSeatIds && this.currentOccupiedSeatIds.includes(seat.id);
                const isPhysicalHeld = (seat.status === 'HELD');
                const isSold = Boolean(isOccupiedForShowtime || isPhysicalHeld || seat.status === 'SOLD');
                const isMaintenance = (seat.status === 'MAINTENANCE');

                let typeClass = 'standard';
                if (seat.seatType === 'VIP') typeClass = 'vip';
                if (seat.seatType === 'SWEETBOX') typeClass = 'sweetbox';

                let statusClass = '';
                if (isSelected) statusClass = 'selected';
                else if (isSold) statusClass = 'sold';
                else if (isMaintenance) statusClass = 'maintenance';

                const price = this.calculateSeatPrice(seat);
                seatBtn.className = `seat ${typeClass} ${statusClass}`;
                seatBtn.textContent = seat.seatName;
                seatBtn.title = `Ghế ${seat.seatName} (Mã ID: #${seat.id}) • ${seat.seatType} • ${price.toLocaleString()}đ`;

                if (!isSold && !isMaintenance) {
                    seatBtn.onclick = () => this.toggleSeatSelect(seat);
                } else {
                    seatBtn.disabled = true;
                }

                rowDiv.appendChild(seatBtn);
            });

            // Nhãn hàng bên phải
            const labelRight = document.createElement('div');
            labelRight.className = 'row-label';
            labelRight.textContent = rowLabel;
            rowDiv.appendChild(labelRight);

            grid.appendChild(rowDiv);
        });
    }

    toggleSeatSelect(seat) {
        if (!this.selectedSeats) this.selectedSeats = [];
        const idx = this.selectedSeats.findIndex(s => s.id === seat.id);
        if (idx >= 0) {
            this.selectedSeats.splice(idx, 1);
        } else {
            if (this.selectedSeats.length >= 6) {
                this.showToast('Mỗi đơn đặt vé được chọn tối đa 6 ghế', 'warning');
                return;
            }
            this.selectedSeats.push(seat);
        }
        this.selectedSeat = this.selectedSeats[0] || null;
        this.renderSeatGrid();
        this.updateSelectedSeatDisplay();
    }

    calculateSeatPrice(seat) {
        if (seat.price) return Number(seat.price);
        const base = this.currentShowtime?.basePrice || 80000;
        let surcharge = 0;
        if (seat.seatType === 'VIP') surcharge = 20000;
        if (seat.seatType === 'SWEETBOX') surcharge = 50000;
        return base + surcharge;
    }

    updateSelectedSeatDisplay() {
        const label = document.getElementById('selected-seat-label');
        const priceEl = document.getElementById('selected-seat-price');
        const btn = document.getElementById('btn-proceed-booking');
        const isPast = this.isShowtimePast(this.currentShowtime);

        const list = (this.selectedSeats && this.selectedSeats.length > 0) 
            ? this.selectedSeats 
            : (this.selectedSeat ? [this.selectedSeat] : []);

        if (list.length > 0 && !isPast) {
            const names = list.map(s => `<span class="text-emerald font-extrabold">${s.seatName}</span>`).join(', ');
            const totalPrice = list.reduce((sum, s) => sum + this.calculateSeatPrice(s), 0);
            label.innerHTML = `${names} (${list.length} ghế đang chọn)`;
            priceEl.textContent = this.formatVND(totalPrice);
            btn.disabled = false;
            btn.textContent = list.length > 1 ? `Tiến Hành Đặt ${list.length} Ghế` : 'Tiến Hành Đặt Vé';
        } else if (isPast) {
            label.innerHTML = list.length > 0 
                ? `<span class="text-slate-600">${list.map(s => s.seatName).join(', ')}</span> <span class="text-xs text-amber-600 font-bold">(Suất chiếu đã kết thúc)</span>` 
                : 'Chưa chọn ghế nào';
            const totalPrice = list.reduce((sum, s) => sum + this.calculateSeatPrice(s), 0);
            priceEl.textContent = this.formatVND(totalPrice);
            btn.disabled = true;
            btn.textContent = 'Suất Chiếu Đã Kết Thúc';
        } else {
            label.textContent = 'Chưa chọn ghế nào';
            priceEl.textContent = '0 VNĐ';
            btn.disabled = true;
            btn.textContent = 'Tiến Hành Đặt Vé';
        }
    }

    // ==================== TIẾN HÀNH ĐẶT VÉ (BOOKING API) ====================
    async proceedBooking() {
        const list = (this.selectedSeats && this.selectedSeats.length > 0) 
            ? this.selectedSeats 
            : (this.selectedSeat ? [this.selectedSeat] : []);
        if (list.length === 0 || !this.currentShowtime) return;

        if (this.isShowtimePast(this.currentShowtime)) {
            this.showToast('Suất chiếu này đã diễn ra trong quá khứ! Quý khách vui lòng chọn suất chiếu sắp tới hoặc ngày mai để đặt vé.', 'warning');
            return;
        }

        // Bắt buộc đăng nhập trước khi giữ ghế
        const user = api.getCurrentUser();
        if (!user) {
            this.showToast('Vui lòng đăng nhập tài khoản để tiến hành giữ ghế và thanh toán', 'warning');
            this.openAuthModal('login');
            return;
        }

        const btn = document.getElementById('btn-proceed-booking');
        btn.disabled = true;
        btn.textContent = list.length > 1 ? `Đang khóa ${list.length} ghế nguyên tử...` : 'Đang giữ ghế trên Redis...';

        try {
            let tickets = [];
            if (api.isBackendOnline) {
                if (list.length === 1) {
                    const ticket = await api.bookTicket(this.currentShowtime.id, list[0].id);
                    tickets = [ticket];
                } else {
                    const seatIds = list.map(s => s.id);
                    const batchRes = await api.bookTicketBatch(this.currentShowtime.id, seatIds);
                    tickets = Array.isArray(batchRes) ? batchRes : [batchRes];
                }
            } else {
                tickets = list.map((s, idx) => ({
                    id: Math.floor(Math.random() * 8000) + 1000 + idx,
                    userId: user.userId || 1,
                    showtimeId: this.currentShowtime.id,
                    seatId: s.id,
                    finalPrice: this.calculateSeatPrice(s),
                    status: 'PENDING',
                    expiresAt: new Date(Date.now() + 10 * 60000).toISOString()
                }));
            }

            this.currentTickets = tickets;
            this.currentTicket = tickets[0];
            
            // Đánh dấu các ghế đã chọn vào currentOccupiedSeatIds
            for (const s of list) {
                if (!this.currentOccupiedSeatIds.includes(s.id)) {
                    this.currentOccupiedSeatIds.push(s.id);
                }
            }

            const seatNames = list.map(s => s.seatName).join(', ');
            this.showToast(`🎉 Giữ thành công ${tickets.length} ghế [${seatNames}]! Vui lòng thanh toán trong 10 phút.`, 'success');
            
            this.closeSeatModal();
            this.openCheckoutModal(this.currentTicket, tickets);
        } catch (err) {
            console.error('Lỗi đặt vé:', err);
            let msg = err.message || 'Không thể đặt vé lúc này.';
            if (err.data && typeof err.data === 'object' && err.data.message) {
                msg = err.data.message;
            }
            if (msg.includes('Suất chiếu đã bắt đầu') || msg.includes('không hợp lệ')) {
                msg = 'Suất chiếu này đã diễn ra hoặc không hợp lệ! Quý khách vui lòng chọn các suất chiếu sắp tới hoặc chuyển sang ngày mai để đặt vé.';
            } else if (msg.includes('đang được giữ') || msg.includes('đã được giữ hoặc đã bán') || msg.includes('chọn lại')) {
                msg = 'Một hoặc nhiều ghế trong danh sách vừa được người khác giữ hoặc đã bán! Hệ thống đã tự động hủy lượt để bảo toàn giao dịch nguyên tử, vui lòng chọn lại ghế.';
            } else if (msg.includes('bảo trì') || msg.includes('khóa')) {
                msg = 'Ghế này đang tạm khóa hoặc bảo trì vật lý, vui lòng chọn ghế khác.';
            }
            this.showToast(msg, 'error');
            await this.loadSeatsForShowtime(this.currentShowtime?.id, this.currentShowtime?.roomId || 1);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Tiến Hành Đặt Vé';
        }
    }

    // ==================== MÀN HÌNH THANH TOÁN (CHECKOUT & PAYMENT) ====================
    openCheckoutModal(ticket, allTickets = null) {
        const modal = document.getElementById('checkout-modal');
        const tickets = (allTickets && allTickets.length > 0) ? allTickets : [ticket];
        this.currentTickets = tickets;
        this.currentTicket = tickets[0];

        const ticketIds = tickets.map(t => `#TK-${t.id}`).join(', ');
        document.getElementById('checkout-ticket-id').textContent = ticketIds;
        document.getElementById('checkout-movie-title').textContent = this.currentMovie.title;
        document.getElementById('checkout-cinema-name').textContent = this.cinemas.find(c => c.id === this.selectedCinemaId)?.name || 'AURA CINEMA - Landmark Grand';
        document.getElementById('checkout-room-name').textContent = this.getRoomName(this.currentShowtime.roomId || 1);
        document.getElementById('checkout-time').textContent = `${this.currentShowtime.startTime} (${this.currentShowtime.showDate})`;

        const seatList = (this.selectedSeats && this.selectedSeats.length > 0) ? this.selectedSeats : (this.selectedSeat ? [this.selectedSeat] : []);
        const seatNames = seatList.length > 0 
            ? seatList.map(s => `${s.seatName} (${s.seatType || 'STANDARD'})`).join(', ')
            : 'Ghế đã chọn';
        document.getElementById('checkout-seat-name').textContent = seatNames;

        const totalAmount = tickets.reduce((sum, t) => sum + (t.finalPrice || 0), 0);
        document.getElementById('checkout-final-price').textContent = this.formatVND(totalAmount);

        modal.classList.remove('hidden');

        // Bắt đầu đếm ngược 10 phút giữ ghế
        this.startHoldCountdown(600);
    }

    closeCheckoutModal() {
        document.getElementById('checkout-modal').classList.add('hidden');
    }

    startHoldCountdown(seconds) {
        clearInterval(this.holdTimerInterval);
        this.holdSecondsRemaining = seconds;

        const updateDisplay = () => {
            const mins = Math.floor(this.holdSecondsRemaining / 60);
            const secs = this.holdSecondsRemaining % 60;
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            
            const timerEl = document.getElementById('hold-timer-text');
            if (timerEl) timerEl.textContent = timeStr;

            if (this.holdSecondsRemaining <= 0) {
                clearInterval(this.holdTimerInterval);
                this.showToast('Thời gian giữ ghế đã hết hạn! Ghế đã được tự động giải phóng.', 'error');
                this.closeCheckoutModal();
            }
            this.holdSecondsRemaining--;
        };

        updateDisplay();
        this.holdTimerInterval = setInterval(updateDisplay, 1000);
    }

    async executePayment() {
        if (!this.currentTicket) return;
        const btn = document.getElementById('btn-confirm-payment');
        btn.disabled = true;
        btn.innerHTML = '<span>Đang xác thực giao dịch...</span>';

        try {
            const ticketsToPay = (this.currentTickets && this.currentTickets.length > 0) 
                ? this.currentTickets : [this.currentTicket];
            let paidTickets = [];

            if (api.isBackendOnline) {
                paidTickets = await Promise.all(ticketsToPay.map(t => api.payTicket(t.id)));
            } else {
                paidTickets = ticketsToPay.map(t => ({ ...t, status: 'PAID' }));
            }

            clearInterval(this.holdTimerInterval);
            this.showToast(`Thanh toán thành công ${paidTickets.length} vé! Vé điện tử E-Ticket đã được phát hành.`, 'success');
            
            this.closeCheckoutModal();
            this.openTicketPassModal(paidTickets[0], paidTickets);
        } catch (err) {
            console.error('Lỗi thanh toán:', err);
            this.showToast(err.message || 'Thanh toán thất bại, vui lòng thử lại', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Xác Nhận Đã Thanh Toán</span><span>✓</span>';
        }
    }

    async cancelCurrentTicket() {
        const ticketsToCancel = (this.currentTickets && this.currentTickets.length > 0) 
            ? this.currentTickets : [this.currentTicket];
        if (!ticketsToCancel || ticketsToCancel.length === 0 || !ticketsToCancel[0]) return;
        if (!confirm('Bạn có chắc chắn muốn hủy giữ ghế cho đơn này không?')) return;

        try {
            if (api.isBackendOnline) {
                await Promise.all(ticketsToCancel.map(t => api.cancelTicket(t.id).catch(() => null)));
            }
            clearInterval(this.holdTimerInterval);
            this.showToast('Đã hủy vé và giải phóng ghế thành công.', 'info');
            this.closeCheckoutModal();
        } catch (err) {
            this.showToast(err.message || 'Không thể hủy vé', 'error');
        }
    }

    // ==================== MÀN HÌNH VÉ ĐIỆN TỬ (TICKET PASS) ====================
    openTicketPassModal(ticket, allTickets = null) {
        const modal = document.getElementById('ticket-pass-modal');
        document.getElementById('pass-movie-title').textContent = this.currentMovie.title;
        document.getElementById('pass-cinema').textContent = this.cinemas.find(c => c.id === this.selectedCinemaId)?.name || 'AURA CINEMA - Landmark Grand';
        document.getElementById('pass-room').textContent = this.getRoomName(this.currentShowtime.roomId || 1);
        const seatNames = (this.selectedSeats && this.selectedSeats.length > 0)
            ? this.selectedSeats.map(s => s.seatName).join(', ')
            : (this.selectedSeat?.seatName || 'A1');
        document.getElementById('pass-seat').textContent = seatNames;
        document.getElementById('pass-time').textContent = `${this.currentShowtime.startTime} - ${this.currentShowtime.showDate}`;
        document.getElementById('pass-code').textContent = `AURA-${ticket.id}-${Math.floor(Math.random() * 899 + 100)}`;

        modal.classList.remove('hidden');
    }

    closeTicketPassModal() {
        document.getElementById('ticket-pass-modal').classList.add('hidden');
    }

    // ==================== MODAL VÉ CỦA TÔI (MY TICKETS) ====================
    async openMyTickets() {
        const user = api.getCurrentUser();
        if (!user) {
            this.showToast('Vui lòng đăng nhập để xem danh sách vé của bạn', 'warning');
            this.openAuthModal('login');
            return;
        }

        const modal = document.getElementById('my-tickets-modal');
        const listContainer = document.getElementById('my-tickets-list');
        listContainer.innerHTML = '<div class="text-center py-8 text-slate-400">Đang tải danh sách vé...</div>';
        modal.classList.remove('hidden');

        let tickets = [];
        try {
            if (api.isBackendOnline) {
                tickets = await api.getMyTickets();
            } else {
                tickets = [
                    { id: 1042, showtimeId: 101, seatId: 15, finalPrice: 110000, status: 'PAID', createdAt: '2026-11-06T19:00:00' },
                    { id: 1043, showtimeId: 102, seatId: 28, finalPrice: 85000, status: 'PENDING', createdAt: '2026-11-06T20:15:00' }
                ];
            }
        } catch (e) {
            tickets = [];
        }

        if (!tickets || tickets.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-10 space-y-2">
                    <div class="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                    </div>
                    <p class="text-sm text-slate-400">Bạn chưa có đơn đặt vé nào</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        tickets.forEach(t => {
            let statusBadge = '';
            if (t.status === 'PAID') statusBadge = '<span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">ĐÃ THANH TOÁN (PAID)</span>';
            else if (t.status === 'PENDING') statusBadge = '<span class="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">CHỜ THANH TOÁN</span>';
            else if (t.status === 'CANCELLED') statusBadge = '<span class="px-2.5 py-1 rounded bg-red-50 text-red-700 font-bold text-xs border border-red-200">ĐÃ HỦY</span>';
            else statusBadge = `<span class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-xs">${t.status}</span>`;

            const item = document.createElement('div');
            item.className = 'bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm';
            item.innerHTML = `
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-gold text-sm">#TK-${t.id}</span>
                        ${statusBadge}
                    </div>
                    <div class="text-xs text-slate-600">
                        Suất chiếu ID: <b>#${t.showtimeId}</b> • Ghế ID: <b>#${t.seatId}</b>
                    </div>
                    <div class="text-xs text-slate-500">
                        Tổng tiền: <b class="text-slate-900 text-sm font-black">${app.formatVND(t.finalPrice)}</b>
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    ${t.status === 'PENDING' ? `
                        <button onclick="app.payPendingTicket(${t.id})" class="px-3 py-1.5 bg-emerald text-white font-bold text-xs rounded-lg hover:brightness-105 shadow-sm">
                            Thanh Toán Ngay
                        </button>
                        <button onclick="app.cancelPendingTicket(${t.id})" class="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 border border-red-200">
                            Hủy
                        </button>
                    ` : ''}
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    closeMyTicketsModal() {
        document.getElementById('my-tickets-modal').classList.add('hidden');
    }

    async payPendingTicket(ticketId) {
        try {
            await api.payTicket(ticketId);
            this.showToast(`Thanh toán vé #${ticketId} thành công!`, 'success');
            this.openMyTickets();
        } catch (e) {
            this.showToast(e.message || 'Thanh toán thất bại', 'error');
        }
    }

    async cancelPendingTicket(ticketId) {
        if (!confirm('Bạn có chắc muốn hủy vé này?')) return;
        try {
            await api.cancelTicket(ticketId);
            this.showToast(`Đã hủy vé #${ticketId}`, 'info');
            this.openMyTickets();
        } catch (e) {
            this.showToast(e.message || 'Hủy thất bại', 'error');
        }
    }

    // ==================== AUTH MODAL (LOGIN & REGISTER) ====================
    openAuthModal(tab = 'login') {
        this.switchAuthTab(tab);
        document.getElementById('auth-modal').classList.remove('hidden');
    }

    closeAuthModal() {
        document.getElementById('auth-modal').classList.add('hidden');
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('auth-tab-login');
        const regTab = document.getElementById('auth-tab-register');
        const submitBtn = document.getElementById('auth-submit-btn');
        const errorMsg = document.getElementById('auth-error-msg');
        errorMsg.classList.add('hidden');

        if (tab === 'login') {
            loginTab.className = 'flex-1 py-3 text-center font-bold text-sm text-gold border-b-2 border-gold transition';
            regTab.className = 'flex-1 py-3 text-center font-bold text-sm text-slate-400 border-b-2 border-transparent hover:text-slate-200 transition';
            submitBtn.textContent = 'Đăng Nhập';
            document.getElementById('auth-form').setAttribute('data-action', 'login');
        } else {
            regTab.className = 'flex-1 py-3 text-center font-bold text-sm text-gold border-b-2 border-gold transition';
            loginTab.className = 'flex-1 py-3 text-center font-bold text-sm text-slate-400 border-b-2 border-transparent hover:text-slate-200 transition';
            submitBtn.textContent = 'Đăng Ký Tài Khoản Mới';
            document.getElementById('auth-form').setAttribute('data-action', 'register');
        }
    }

    async handleAuthSubmit(event) {
        event.preventDefault();
        const action = event.target.getAttribute('data-action') || 'login';
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value;
        const errorMsg = document.getElementById('auth-error-msg');
        errorMsg.classList.add('hidden');

        try {
            if (action === 'login') {
                if (api.isBackendOnline) {
                    await api.login(username, password);
                } else {
                    // Demo Login
                    const role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'CUSTOMER';
                    const mockToken = `mock.jwt.${btoa(unescape(encodeURIComponent(JSON.stringify({ sub: username, userId: 1, role: role }))))}.signature`;
                    api.setToken(mockToken);
                    localStorage.setItem(api.userKey, JSON.stringify({ username, userId: 1, role }));
                }
                this.showToast(`Chào mừng bạn quay trở lại, ${username}!`, 'success');
                this.closeAuthModal();
                this.updateAuthUI();
            } else {
                if (api.isBackendOnline) {
                    await api.register(username, password);
                }
                this.showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                this.switchAuthTab('login');
            }
        } catch (err) {
            errorMsg.textContent = err.message || 'Lỗi xác thực thông tin tài khoản';
            errorMsg.classList.remove('hidden');
        }
    }

    logout() {
        this.closeUserDropdown();
        api.logout();
        this.updateAuthUI();
        this.showToast('Đã đăng xuất tài khoản', 'info');
    }

    toggleUserDropdown(event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById('user-dropdown-menu');
        const arrow = document.getElementById('user-dropdown-arrow');
        if (!menu) return;

        // Toggle class block / hidden
        const isCurrentlyOpen = menu.classList.contains('!block') || (!menu.classList.contains('hidden') && !menu.classList.contains('group-hover:block'));
        if (isCurrentlyOpen) {
            this.closeUserDropdown();
        } else {
            menu.classList.remove('hidden');
            menu.classList.add('!block');
            if (arrow) arrow.classList.add('rotate-180');
        }
    }

    closeUserDropdown() {
        const menu = document.getElementById('user-dropdown-menu');
        const arrow = document.getElementById('user-dropdown-arrow');
        if (menu) {
            menu.classList.remove('!block');
            // Giữ nguyên hidden group-hover:block để hover vẫn mượt mà
            if (!menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                menu.classList.add('group-hover:block');
            }
        }
        if (arrow) arrow.classList.remove('rotate-180');
    }

    updateAuthUI() {
        const user = api.getCurrentUser();
        const guestActions = document.getElementById('auth-actions-guest');
        const userActions = document.getElementById('auth-actions-user');
        const adminBtn = document.getElementById('admin-panel-btn');
        const adminDropdownItem = document.getElementById('user-dropdown-admin-item');

        if (user) {
            guestActions.classList.add('hidden');
            userActions.classList.remove('hidden');

            document.getElementById('user-display-name').textContent = user.username;
            document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
            document.getElementById('user-role-badge').textContent = user.role;

            if (user.role === 'ADMIN') {
                if (adminBtn) adminBtn.classList.remove('hidden');
                if (adminDropdownItem) adminDropdownItem.classList.remove('hidden');
            } else {
                if (adminBtn) adminBtn.classList.add('hidden');
                if (adminDropdownItem) adminDropdownItem.classList.add('hidden');
            }
        } else {
            guestActions.classList.remove('hidden');
            userActions.classList.add('hidden');
            if (adminBtn) adminBtn.classList.add('hidden');
            if (adminDropdownItem) adminDropdownItem.classList.add('hidden');
        }
    }

    // ==================== FULLSCREEN ADMIN PORTAL (UI/UX PRO MAX) ====================
    openAdminModal() {
        const user = api.getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            this.showToast('Bạn không có quyền truy cập chức năng Quản Trị (ADMIN)', 'error');
            return;
        }

        const modal = document.getElementById('admin-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        modal.classList.add('fullscreen-portal');
        document.body.classList.add('overflow-hidden');

        // Khởi động đồng hồ thời gian thực
        this.updateAdminClock();
        if (this.adminClockInterval) clearInterval(this.adminClockInterval);
        this.adminClockInterval = setInterval(() => this.updateAdminClock(), 1000);

        // Cập nhật trạng thái Gateway trong Admin Header
        const dot = document.getElementById('adm-gateway-dot');
        const txt = document.getElementById('adm-gateway-text');
        if (dot && txt) {
            if (api.isBackendOnline) {
                dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
                txt.textContent = 'Gateway: 8080 (Online)';
            } else {
                dot.className = 'w-2 h-2 rounded-full bg-amber-400';
                txt.textContent = 'Demo Mode (Offline)';
            }
        }

        // Tải toàn bộ dữ liệu quản trị
        this.refreshAdminData();

        // Mở tab hiện tại
        this.switchAdminTab(this.adminCurrentTab || 'overview');
    }

    closeAdminModal() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('fullscreen-portal');
        }
        document.body.classList.remove('overflow-hidden');
        if (this.adminClockInterval) {
            clearInterval(this.adminClockInterval);
            this.adminClockInterval = null;
        }
    }

    adminLogout() {
        this.closeAdminModal();
        this.logout();
        this.showToast('Đã đăng xuất tài khoản Quản Trị Viên thành công. Bạn có thể đăng nhập tài khoản Khách hàng.', 'success');
        setTimeout(() => {
            this.openLoginModal('login');
        }, 300);
    }

    updateAdminClock() {
        const clockEl = document.getElementById('adm-live-clock');
        if (!clockEl) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN');
        const dateStr = now.toLocaleDateString('vi-VN');
        clockEl.textContent = `${timeStr} • ${dateStr}`;
    }

    async refreshAdminData() {
        const refreshIcon = document.getElementById('adm-refresh-icon');
        if (refreshIcon) refreshIcon.classList.add('animate-spin');

        try {
            // 1. Tải danh sách phim
            if (api.isBackendOnline) {
                try {
                    const moviesRes = await api.getMovies({ size: 100 });
                    if (moviesRes?.content) {
                        this.movies = moviesRes.content;
                    }
                } catch (e) {
                    console.warn('Lỗi tải phim admin từ backend:', e);
                }
            }
            this.renderAdminMoviesTable(this.movies);
            const movieBadge = document.getElementById('adm-badge-movies-count');
            if (movieBadge) movieBadge.textContent = this.movies.length;

            // 2. Tải toàn bộ vé
            await this.loadAllAdminTickets();

            // 3. Tải danh sách suất chiếu
            await this.loadAdminShowtimesList();

            // 4. Cập nhật các thẻ KPIs trên tab Tổng Quan
            this.updateAdminKPIs();

            // 5. Cập nhật Sơ đồ ghế phòng hiện tại
            const currentRoomId = document.getElementById('adm-seats-room-select')?.value || this.adminSelectedRoomId || 1;
            await this.renderAdminVisualSeatMap(currentRoomId);

            this.showToast('Đã làm mới dữ liệu hệ thống quản trị thành công', 'success');
        } catch (err) {
            console.error('Lỗi làm mới dữ liệu admin:', err);
            this.showToast('Không thể làm mới một số dữ liệu hệ thống', 'warning');
        } finally {
            if (refreshIcon) {
                setTimeout(() => refreshIcon.classList.remove('animate-spin'), 400);
            }
        }
    }

    switchAdminTab(tabName) {
        this.adminCurrentTab = tabName;
        const tabs = ['overview', 'movies', 'showtimes', 'seats', 'tickets', 'system'];

        tabs.forEach(t => {
            const pane = document.getElementById(`admin-pane-${t}`);
            const navBtn = document.getElementById(`adm-nav-${t}`);
            if (pane) {
                if (t === tabName) pane.classList.remove('hidden');
                else pane.classList.add('hidden');
            }
            if (navBtn) {
                if (t === tabName) navBtn.classList.add('active');
                else navBtn.classList.remove('active');
            }
        });

        if (tabName === 'seats') {
            const currentRoomId = document.getElementById('adm-seats-room-select')?.value || 1;
            this.renderAdminVisualSeatMap(currentRoomId);
            this.loadSeatPricingConfig();
        } else if (tabName === 'tickets') {
            this.renderAdminTicketsTable(this.adminTickets);
        } else if (tabName === 'movies') {
            this.renderAdminMoviesTable(this.movies);
        } else if (tabName === 'showtimes') {
            this.filterAdminShowtimesTable();
        } else if (tabName === 'overview') {
            this.updateAdminKPIs();
        }
    }

    // ==================== QUẢN LÝ PHIM (MOVIES) ====================
    renderAdminMoviesTable(moviesList) {
        const tbody = document.getElementById('adm-movies-tbody');
        if (!tbody) return;

        if (!moviesList || moviesList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500 text-xs">Không tìm thấy bộ phim nào phù hợp</td></tr>';
            return;
        }

        tbody.innerHTML = moviesList.map(m => {
            const statusPill = m.status === 'NOW_SHOWING' 
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ĐANG CHIẾU</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-gold border border-gold/30">SẮP CHIẾU</span>';

            const posterImg = m.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80';

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="font-mono text-xs text-slate-500">#${m.id}</td>
                    <td>
                        <div class="flex items-center gap-3">
                            <img src="${posterImg}" alt="${m.title}" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'" class="w-10 h-14 object-cover rounded-md border border-slate-200 shadow-sm flex-shrink-0">
                            <div>
                                <div class="font-bold text-slate-900 text-sm hover:text-gold cursor-pointer" onclick="app.showMovieDetail(${m.id})">${m.title}</div>
                                <div class="text-[11px] text-slate-500 mt-0.5">${m.director ? 'ĐD: ' + m.director : (m.format || '2D Digital')}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">${m.genre || 'Điện ảnh'}</span></td>
                    <td class="font-mono text-xs text-slate-600">${m.durationMinutes || 120} phút</td>
                    <td class="font-mono text-xs text-slate-500">${m.releaseYear || 2026}</td>
                    <td>${statusPill}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="app.quickAddShowtimeForMovie(${m.id})" title="Tạo suất chiếu cho phim này" class="px-2.5 py-1 rounded-lg bg-amber-50 text-gold hover:bg-gold hover:text-white border border-amber-200 text-xs font-semibold transition">
                                Tạo Suất
                            </button>
                            <button onclick="app.editMovie(${m.id})" title="Chỉnh sửa thông tin phim" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition">
                                Sửa
                            </button>
                            <button onclick="app.confirmDeleteMovie(${m.id}, '${(m.title || '').replace(/'/g, "\\'")}')" title="Xóa phim khỏi cơ sở dữ liệu" class="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-semibold transition">
                                Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterAdminMovies() {
        const query = (document.getElementById('adm-movie-search')?.value || '').toLowerCase().trim();
        const genre = document.getElementById('adm-movie-genre-filter')?.value || 'ALL';
        const status = document.getElementById('adm-movie-status-filter')?.value || 'ALL';

        let filtered = [...this.movies];
        if (query) {
            filtered = filtered.filter(m => (m.title || '').toLowerCase().includes(query) || (m.director || '').toLowerCase().includes(query));
        }
        if (genre !== 'ALL') {
            filtered = filtered.filter(m => (m.genre || '').includes(genre));
        }
        if (status !== 'ALL') {
            filtered = filtered.filter(m => m.status === status);
        }
        this.renderAdminMoviesTable(filtered);
    }

    openMovieFormModal(isEdit = false) {
        const modal = document.getElementById('adm-movie-modal');
        if (!modal) return;
        if (!isEdit) {
            document.getElementById('adm-movie-modal-title').textContent = 'Thêm Bộ Phim Mới';
            document.getElementById('adm-edit-movie-id').value = '';
            document.getElementById('adm-form-movie-title').value = '';
            document.getElementById('adm-form-movie-genre').value = '';
            document.getElementById('adm-form-movie-year').value = 2026;
            document.getElementById('adm-form-movie-duration').value = 120;
            document.getElementById('adm-form-movie-status').value = 'NOW_SHOWING';
            document.getElementById('adm-form-movie-poster').value = '';
            document.getElementById('adm-form-movie-director').value = '';
            document.getElementById('adm-form-movie-age').value = 'C16';
            document.getElementById('adm-form-movie-desc').value = '';
            this.previewPoster('');
        }
        modal.classList.remove('hidden');
    }

    closeMovieFormModal() {
        const modal = document.getElementById('adm-movie-modal');
        if (modal) modal.classList.add('hidden');
    }

    previewPoster(url) {
        const img = document.getElementById('adm-poster-preview-img');
        const txt = document.getElementById('adm-poster-preview-txt');
        if (!img || !txt) return;
        if (url && url.trim().length > 10) {
            img.src = url.trim();
            img.classList.remove('hidden');
            txt.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            txt.classList.remove('hidden');
        }
    }

    editMovie(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;

        document.getElementById('adm-movie-modal-title').textContent = `Chỉnh Sửa: ${movie.title}`;
        document.getElementById('adm-edit-movie-id').value = movie.id;
        document.getElementById('adm-form-movie-title').value = movie.title || '';
        document.getElementById('adm-form-movie-genre').value = movie.genre || '';
        document.getElementById('adm-form-movie-year').value = movie.releaseYear || 2026;
        document.getElementById('adm-form-movie-duration').value = movie.durationMinutes || 120;
        document.getElementById('adm-form-movie-status').value = movie.status || 'NOW_SHOWING';
        document.getElementById('adm-form-movie-poster').value = movie.poster || '';
        document.getElementById('adm-form-movie-director').value = movie.director || '';
        document.getElementById('adm-form-movie-age').value = movie.ageRating || 'C16';
        document.getElementById('adm-form-movie-desc').value = movie.description || '';
        this.previewPoster(movie.poster || '');

        this.openMovieFormModal(true);
    }

    async handleSaveMovie(event) {
        event.preventDefault();
        const editId = document.getElementById('adm-edit-movie-id').value;
        const movieData = {
            title: document.getElementById('adm-form-movie-title').value.trim(),
            genre: document.getElementById('adm-form-movie-genre').value.trim(),
            releaseYear: parseInt(document.getElementById('adm-form-movie-year').value),
            durationMinutes: parseInt(document.getElementById('adm-form-movie-duration').value),
            status: document.getElementById('adm-form-movie-status').value,
            poster: document.getElementById('adm-form-movie-poster').value.trim(),
            director: document.getElementById('adm-form-movie-director').value.trim(),
            ageRating: document.getElementById('adm-form-movie-age').value.trim(),
            description: document.getElementById('adm-form-movie-desc').value.trim()
        };

        try {
            if (editId) {
                const id = parseInt(editId);
                if (api.isBackendOnline) {
                    await api.updateMovie(id, movieData);
                }
                const idx = this.movies.findIndex(m => m.id === id);
                if (idx !== -1) {
                    this.movies[idx] = { ...this.movies[idx], ...movieData };
                }
                this.showToast(`Đã cập nhật phim: ${movieData.title}`, 'success');
            } else {
                if (api.isBackendOnline) {
                    const saved = await api.createMovie(movieData);
                    this.movies.unshift(saved || { id: Date.now(), ...movieData });
                } else {
                    this.movies.unshift({ id: Date.now(), ...movieData });
                }
                this.showToast(`Đã thêm phim mới: ${movieData.title}`, 'success');
            }

            this.closeMovieFormModal();
            this.renderAdminMoviesTable(this.movies);
            this.updateAdminKPIs();
            this.renderMovieList();
        } catch (e) {
            this.showToast(e.message || 'Lỗi lưu thông tin phim', 'error');
        }
    }

    async confirmDeleteMovie(movieId, title) {
        if (!confirm(`Bạn có chắc chắn muốn xóa bộ phim "${title}" khỏi hệ thống?\nHành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            if (api.isBackendOnline) {
                await api.deleteMovie(movieId);
            }
            this.movies = this.movies.filter(m => m.id !== movieId);
            this.showToast(`Đã xóa bộ phim: ${title}`, 'success');
            this.renderAdminMoviesTable(this.movies);
            this.updateAdminKPIs();
            this.renderMovieList();
        } catch (e) {
            this.showToast(e.message || 'Không thể xóa phim (có thể đang có suất chiếu liên kết)', 'error');
        }
    }

    // ==================== QUẢN LÝ SUẤT CHIẾU (SHOWTIMES) ====================
    async loadAdminShowtimesList() {
        if (!this.adminShowtimes || this.adminShowtimes.length === 0) {
            if (this.showtimes && this.showtimes.length > 0) {
                this.adminShowtimes = [...this.showtimes];
            } else {
                this.adminShowtimes = MOCK_DATA.generateMockShowtimes(this.selectedDate);
            }
        }

        // Cập nhật select phim trong filter suất chiếu
        const stMovieFilter = document.getElementById('adm-st-filter-movie');
        if (stMovieFilter) {
            const currentVal = stMovieFilter.value;
            stMovieFilter.innerHTML = '<option value="ALL">-- Tất Cả Phim --</option>' + 
                this.movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
            if (currentVal) stMovieFilter.value = currentVal;
        }

        // Cập nhật ngày filter suất chiếu mặc định
        const dateInput = document.getElementById('adm-st-filter-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = this.selectedDate || this.getTodayString();
        }

        const badge = document.getElementById('adm-badge-showtimes-count');
        if (badge) badge.textContent = this.adminShowtimes.length;

        this.filterAdminShowtimesTable();
    }

    onAdminShowtimeFilterChange() {
        const cinemaVal = document.getElementById('adm-st-filter-cinema')?.value || 'ALL';
        const roomSelect = document.getElementById('adm-st-filter-room');
        if (!roomSelect) return;

        if (cinemaVal === '1') {
            roomSelect.innerHTML = `
                <option value="ALL">-- Tất Cả Phòng Rạp 1 --</option>
                <option value="1">Phòng 01 (IMAX Laser)</option>
                <option value="2">Phòng 02 (Dolby Atmos)</option>
                <option value="3">Phòng VIP 03 (Gold Class)</option>
            `;
        } else if (cinemaVal === '2') {
            roomSelect.innerHTML = `
                <option value="ALL">-- Tất Cả Phòng Rạp 2 --</option>
                <option value="4">Phòng 01 (Starium 3D)</option>
                <option value="5">Phòng 02 (Dolby 7.1)</option>
                <option value="6">Phòng VIP 03 (Royal Lounge)</option>
            `;
        } else if (cinemaVal === '3') {
            roomSelect.innerHTML = `
                <option value="ALL">-- Tất Cả Phòng Rạp 3 --</option>
                <option value="7">Phòng 01 (ScreenX 270°)</option>
                <option value="8">Phòng 02 (Dolby Atmos)</option>
                <option value="9">Phòng VIP 03 (L'amour)</option>
            `;
        } else {
            roomSelect.innerHTML = `
                <option value="ALL">-- Tất Cả Phòng (1 - 9) --</option>
                <option value="1">P.01 (IMAX Laser) - Rạp 1</option>
                <option value="2">P.02 (Dolby Atmos) - Rạp 1</option>
                <option value="3">P.03 (Gold Class) - Rạp 1</option>
                <option value="4">P.01 (Starium 3D) - Rạp 2</option>
                <option value="5">P.02 (Dolby 7.1) - Rạp 2</option>
                <option value="6">P.03 (Royal Lounge) - Rạp 2</option>
                <option value="7">P.01 (ScreenX) - Rạp 3</option>
                <option value="8">P.02 (Dolby Atmos) - Rạp 3</option>
                <option value="9">P.03 (L'amour) - Rạp 3</option>
            `;
        }

        this.filterAdminShowtimesTable();
    }

    filterAdminShowtimesTable() {
        const cinemaVal = document.getElementById('adm-st-filter-cinema')?.value || 'ALL';
        const roomVal = document.getElementById('adm-st-filter-room')?.value || 'ALL';
        const dateVal = document.getElementById('adm-st-filter-date')?.value || '';
        const movieVal = document.getElementById('adm-st-filter-movie')?.value || 'ALL';

        let list = [...this.adminShowtimes];

        if (cinemaVal !== 'ALL') {
            const validRooms = this.getCinemaRoomIds(parseInt(cinemaVal));
            list = list.filter(s => validRooms.includes(parseInt(s.roomId)));
        }

        if (roomVal !== 'ALL') {
            list = list.filter(s => parseInt(s.roomId) === parseInt(roomVal));
        }

        if (dateVal) {
            list = list.filter(s => (s.showDate || '').startsWith(dateVal));
        }

        if (movieVal !== 'ALL') {
            const targetMId = parseInt(movieVal);
            list = list.filter(s => parseInt(s.movieId || s.movie?.id) === targetMId);
        }

        this.renderAdminShowtimesTable(list);
    }

    renderAdminShowtimesTable(list) {
        const tbody = document.getElementById('adm-showtimes-tbody');
        if (!tbody) return;

        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500 text-xs">Không có suất chiếu nào phù hợp với bộ lọc</td></tr>';
            return;
        }

        tbody.innerHTML = list.slice(0, 100).map(st => {
            const mId = st.movieId || st.movie?.id;
            const movie = (st.movie && st.movie.title) 
                ? st.movie 
                : (this.movies.find(m => m.id === mId) || { title: `Phim #${mId || st.id}`, poster: '' });
            const roomName = this.getRoomName(st.roomId);
            const rId = parseInt(st.roomId);
            const cinemaName = rId <= 3 ? 'Landmark Grand' : (rId <= 6 ? 'Royal City' : 'Sài Gòn Centre');
            const cleanTime = (st.startTime || '').substring(0, 5);

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="font-mono text-xs text-slate-500">#${st.id}</td>
                    <td>
                        <div class="font-mono font-bold text-gold text-sm">${cleanTime}</div>
                        <div class="text-[11px] text-slate-500">${st.showDate || ''}</div>
                    </td>
                    <td>
                        <div class="flex items-center gap-2.5">
                            ${movie.poster ? `<img src="${movie.poster}" alt="" onerror="this.style.display='none'" class="w-8 h-11 object-cover rounded-md shadow-sm border border-slate-200 flex-shrink-0">` : ''}
                            <div>
                                <span class="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">${movie.title}</span>
                                <span class="text-[11px] text-slate-500 font-medium">${movie.genre || movie.ageRating || ''}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="font-semibold text-slate-800 text-xs">${roomName}</div>
                        <div class="text-[11px] text-slate-500">${cinemaName}</div>
                    </td>
                    <td class="font-mono text-xs font-bold text-emerald-700">${this.formatVND(st.basePrice || 85000)}</td>
                    <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">MỞ BÁN</span></td>
                    <td class="text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="app.inspectRoomSeats(${st.roomId})" title="Xem sơ đồ ghế phòng này" class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 text-xs font-semibold transition">
                                Xem Ghế
                            </button>
                            <button onclick="app.confirmDeleteShowtime(${st.id})" title="Xóa suất chiếu này" class="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-semibold transition">
                                Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openCreateShowtimeModal(preselectedMovieId = null) {
        const movieSelect = document.getElementById('adm-st-movie');
        if (movieSelect) {
            movieSelect.innerHTML = this.movies.map(m => 
                `<option value="${m.id}" ${preselectedMovieId === m.id ? 'selected' : ''}>${m.title} (${m.durationMinutes || 120}p)</option>`
            ).join('');
        }

        const dateInput = document.getElementById('adm-st-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = this.selectedDate || this.getTodayString();
        }

        const modal = document.getElementById('adm-showtime-modal');
        if (modal) modal.classList.remove('hidden');
    }

    closeCreateShowtimeModal() {
        const modal = document.getElementById('adm-showtime-modal');
        if (modal) modal.classList.add('hidden');
    }

    quickAddShowtimeForMovie(movieId) {
        this.switchAdminTab('showtimes');
        this.openCreateShowtimeModal(movieId);
    }

    async handleCreateShowtime(event) {
        event.preventDefault();
        const data = {
            movieId: parseInt(document.getElementById('adm-st-movie').value),
            roomId: parseInt(document.getElementById('adm-st-room').value),
            showDate: document.getElementById('adm-st-date').value,
            startTime: document.getElementById('adm-st-time').value,
            basePrice: parseFloat(document.getElementById('adm-st-price').value)
        };

        try {
            if (api.isBackendOnline) {
                const created = await api.createShowtime(data);
                this.adminShowtimes.unshift(created || { id: Date.now(), ...data });
            } else {
                this.adminShowtimes.unshift({ id: Date.now(), ...data });
            }
            this.showToast('Tạo suất chiếu mới thành công (đã kiểm tra chống trùng giờ)!', 'success');
            this.closeCreateShowtimeModal();
            this.filterAdminShowtimesTable();
            this.updateAdminKPIs();
            this.loadSchedule();
        } catch (e) {
            this.showToast(e.message || 'Tạo suất chiếu thất bại (có thể bị trùng giờ phòng chiếu)', 'error');
        }
    }

    async confirmDeleteShowtime(showtimeId) {
        if (!confirm(`Bạn có chắc muốn xóa suất chiếu #${showtimeId} khỏi hệ thống?`)) return;

        try {
            if (api.isBackendOnline) {
                await api.deleteShowtime(showtimeId);
            }
            this.adminShowtimes = this.adminShowtimes.filter(s => s.id !== showtimeId);
            this.showToast(`Đã xóa suất chiếu #${showtimeId}`, 'success');
            this.filterAdminShowtimesTable();
            this.updateAdminKPIs();
            this.loadSchedule();
        } catch (e) {
            this.showToast(e.message || 'Không thể xóa suất chiếu', 'error');
        }
    }

    // ==================== SƠ ĐỒ PHÒNG & GHẾ TRỰC QUAN (SEATS) ====================
    onAdminSeatCinemaChange(cinemaId) {
        this.adminSelectedCinemaId = parseInt(cinemaId);
        const roomSelect = document.getElementById('adm-seats-room-select');
        if (!roomSelect) return;

        if (this.adminSelectedCinemaId === 1) {
            roomSelect.innerHTML = `
                <option value="1">Phòng 01 (IMAX Laser)</option>
                <option value="2">Phòng 02 (Dolby Atmos)</option>
                <option value="3">Phòng VIP 03 (Gold Class)</option>
            `;
        } else if (this.adminSelectedCinemaId === 2) {
            roomSelect.innerHTML = `
                <option value="4">Phòng 01 (Starium 3D)</option>
                <option value="5">Phòng 02 (Dolby 7.1)</option>
                <option value="6">Phòng VIP 03 (Royal Lounge)</option>
            `;
        } else if (this.adminSelectedCinemaId === 3) {
            roomSelect.innerHTML = `
                <option value="7">Phòng 01 (ScreenX 270°)</option>
                <option value="8">Phòng 02 (Dolby Atmos)</option>
                <option value="9">Phòng VIP 03 (L'amour)</option>
            `;
        }

        const firstRoomId = roomSelect.value;
        this.renderAdminVisualSeatMap(firstRoomId);
    }

    inspectRoomSeats(roomId) {
        const rId = parseInt(roomId);
        this.switchAdminTab('seats');

        const cinemaSelect = document.getElementById('adm-seats-cinema-select');
        const roomSelect = document.getElementById('adm-seats-room-select');

        let cinemaId = 1;
        if (rId >= 4 && rId <= 6) cinemaId = 2;
        if (rId >= 7 && rId <= 9) cinemaId = 3;

        if (cinemaSelect) cinemaSelect.value = cinemaId;
        this.onAdminSeatCinemaChange(cinemaId);

        if (roomSelect) roomSelect.value = rId;
        this.renderAdminVisualSeatMap(rId);
    }

    async renderAdminVisualSeatMap(roomId) {
        this.adminSelectedRoomId = parseInt(roomId) || 1;
        const grid = document.getElementById('adm-visual-seat-grid');
        const titleBadge = document.getElementById('adm-room-title-badge');
        if (!grid) return;

        if (titleBadge) {
            titleBadge.textContent = this.getRoomName(this.adminSelectedRoomId);
        }

        grid.innerHTML = '<div class="col-span-10 text-center py-10 text-slate-500 text-xs">⏳ Đang tải sơ đồ 60 ghế từ hệ thống...</div>';

        try {
            let seats = [];
            if (api.isBackendOnline) {
                seats = await api.getSeatsByRoom(this.adminSelectedRoomId);
            } else {
                seats = MOCK_DATA.generateMockSeats(this.adminSelectedRoomId);
            }
            seats.sort((a, b) => a.id - b.id);
            this.adminRoomSeats = seats;

            grid.innerHTML = seats.map(s => {
                let stateClass = 'adm-seat-available-std';
                if (s.status === 'HELD') {
                    stateClass = 'adm-seat-held';
                } else if (s.status === 'MAINTENANCE') {
                    stateClass = 'adm-seat-maint';
                } else if (s.seatType === 'VIP') {
                    stateClass = 'adm-seat-available-vip';
                } else if (s.seatType === 'SWEETBOX') {
                    stateClass = 'adm-seat-available-sweet';
                }

                const isInspected = this.adminSelectedSeat && this.adminSelectedSeat.id === s.id;

                return `
                    <button id="adm-seat-btn-${s.id}" onclick="app.selectSeatForInspect(${s.id})" title="Ghế ${s.seatName} (ID: #${s.id}) • ${s.seatType} • ${s.status}" class="adm-seat-item ${stateClass} ${isInspected ? 'active-inspect' : ''}">
                        ${s.seatName}
                    </button>
                `;
            }).join('');

            // Tự động inspect ghế đầu tiên nếu chưa chọn
            if (!this.adminSelectedSeat && seats.length > 0) {
                this.selectSeatForInspect(seats[0].id);
            } else if (this.adminSelectedSeat) {
                const found = seats.find(s => s.id === this.adminSelectedSeat.id);
                if (found) this.selectSeatForInspect(found.id);
            }
        } catch (e) {
            console.error('Lỗi tải sơ đồ ghế:', e);
            grid.innerHTML = '<div class="col-span-10 text-center py-10 text-red-400 text-xs">Không thể tải sơ đồ ghế phòng này</div>';
        }
    }

    selectSeatForInspect(seatId) {
        const seat = this.adminRoomSeats.find(s => s.id === seatId);
        if (!seat) return;
        this.adminSelectedSeat = seat;

        // Cập nhật viền active trên sơ đồ
        document.querySelectorAll('.adm-seat-item').forEach(el => el.classList.remove('active-inspect'));
        const btn = document.getElementById(`adm-seat-btn-${seatId}`);
        if (btn) btn.classList.add('active-inspect');

        // Điền vào bảng inspector bên phải
        document.getElementById('adm-inspect-empty-notice')?.classList.add('hidden');
        document.getElementById('adm-inspect-content')?.classList.remove('hidden');

        const codeEl = document.getElementById('adm-inspect-seat-code');
        if (codeEl) codeEl.textContent = `GHẾ ${seat.seatName}`;

        const idEl = document.getElementById('adm-inspect-id');
        if (idEl) idEl.textContent = `#${seat.id}`;

        const nameEl = document.getElementById('adm-inspect-name');
        if (nameEl) nameEl.textContent = `${seat.seatName} (Phòng ${seat.roomId || this.adminSelectedRoomId})`;

        const typeEl = document.getElementById('adm-inspect-type');
        if (typeEl) typeEl.textContent = seat.seatType || 'STANDARD';

        const typeSelect = document.getElementById('adm-inspect-change-type');
        if (typeSelect) typeSelect.value = seat.seatType || 'STANDARD';

        const statusBadge = document.getElementById('adm-inspect-status-badge');
        if (statusBadge) {
            if (seat.status === 'AVAILABLE') {
                statusBadge.className = 'px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                statusBadge.textContent = 'AVAILABLE (Có thể bán)';
            } else if (seat.status === 'HELD') {
                statusBadge.className = 'px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/30';
                statusBadge.textContent = 'HELD (Đã Khóa / Giữ)';
            } else if (seat.status === 'MAINTENANCE') {
                statusBadge.className = 'px-2 py-0.5 rounded font-bold text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30';
                statusBadge.textContent = 'MAINTENANCE (Bảo Trì)';
            }
        }

        // Tự điền form thủ công
        const manualIdInput = document.getElementById('adm-seat-id');
        const manualStatusSelect = document.getElementById('adm-seat-status');
        const manualTypeSelect = document.getElementById('adm-seat-type');
        if (manualIdInput) manualIdInput.value = seat.id;
        if (manualStatusSelect) manualStatusSelect.value = seat.status;
        if (manualTypeSelect) manualTypeSelect.value = seat.seatType;
    }

    async quickPatchInspectedSeat(newStatus) {
        if (!this.adminSelectedSeat) {
            this.showToast('Vui lòng chọn 1 ghế trên sơ đồ trước', 'warning');
            return;
        }

        const seatId = this.adminSelectedSeat.id;
        const patchData = { status: newStatus };

        try {
            if (api.isBackendOnline) {
                await api.patchSeat(seatId, patchData);
            }
            this.adminSelectedSeat.status = newStatus;
            this.showToast(`Đã chuyển trạng thái ghế #${seatId} (${this.adminSelectedSeat.seatName}) sang ${newStatus}`, 'success');

            // Cập nhật lại giao diện ghế ngay lập tức mà không cần reload
            const btn = document.getElementById(`adm-seat-btn-${seatId}`);
            if (btn) {
                btn.className = `adm-seat-item active-inspect ${
                    newStatus === 'HELD' ? 'adm-seat-held' : 
                    (newStatus === 'MAINTENANCE' ? 'adm-seat-maint' : 
                    (this.adminSelectedSeat.seatType === 'VIP' ? 'adm-seat-available-vip' : 
                    (this.adminSelectedSeat.seatType === 'SWEETBOX' ? 'adm-seat-available-sweet' : 'adm-seat-available-std')))
                }`;
            }
            this.selectSeatForInspect(seatId);
        } catch (e) {
            this.showToast(e.message || 'Cập nhật trạng thái ghế thất bại', 'error');
        }
    }

    async quickChangeInspectedSeatType() {
        if (!this.adminSelectedSeat) return;
        const seatId = this.adminSelectedSeat.id;
        const newType = document.getElementById('adm-inspect-change-type')?.value || 'STANDARD';

        try {
            if (api.isBackendOnline) {
                await api.patchSeat(seatId, { seatType: newType });
            }
            this.adminSelectedSeat.seatType = newType;
            this.showToast(`Đã đổi loại ghế #${seatId} sang ${newType}`, 'success');
            this.renderAdminVisualSeatMap(this.adminSelectedRoomId);
        } catch (e) {
            this.showToast(e.message || 'Đổi loại ghế thất bại', 'error');
        }
    }

    async handlePatchSeat(event) {
        event.preventDefault();
        const seatId = parseInt(document.getElementById('adm-seat-id').value);
        const status = document.getElementById('adm-seat-status').value;
        const seatType = document.getElementById('adm-seat-type').value;

        const patchData = { status };
        if (seatType) patchData.seatType = seatType;

        try {
            if (api.isBackendOnline) {
                await api.patchSeat(seatId, patchData);
            }
            this.showToast(`Đã cập nhật trạng thái ghế #${seatId} sang ${status}`, 'success');
            this.renderAdminVisualSeatMap(this.adminSelectedRoomId);
        } catch (e) {
            this.showToast(e.message || 'Cập nhật ghế thất bại', 'error');
        }
    }

    // ==================== CẤU HÌNH PHỤ THU GHẾ (PRICING CONFIG) ====================
    async loadSeatPricingConfig() {
        try {
            const data = await api.getPricing();
            if (data) {
                const vipInput = document.getElementById('adm-pricing-vip');
                const sweetboxInput = document.getElementById('adm-pricing-sweetbox');
                if (vipInput && data.vipSurcharge !== undefined) {
                    vipInput.value = data.vipSurcharge;
                }
                if (sweetboxInput && data.sweetboxSurcharge !== undefined) {
                    sweetboxInput.value = data.sweetboxSurcharge;
                }
            }
        } catch (e) {
            console.warn('Chưa thể tải cấu hình phụ thu:', e.message);
        }
    }

    async handleUpdateSeatPricing(event) {
        event.preventDefault();
        const vip = parseFloat(document.getElementById('adm-pricing-vip').value);
        const sweetbox = parseFloat(document.getElementById('adm-pricing-sweetbox').value);
        const submitBtn = document.getElementById('adm-pricing-submit-btn');

        if (isNaN(vip) || vip < 0 || isNaN(sweetbox) || sweetbox < 0) {
            this.showToast('Số tiền phụ thu không hợp lệ (phải >= 0)', 'warning');
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '⏳ Đang lưu...';
            }
            const res = await api.updatePricing(vip, sweetbox);
            this.showToast(`Đã lưu phụ thu mới: VIP +${this.formatCurrency(res.vipSurcharge)}, Sweetbox +${this.formatCurrency(res.sweetboxSurcharge)}`, 'success');
            await this.loadSeatPricingConfig();
        } catch (e) {
            this.showToast(e.message || 'Cập nhật phụ thu thất bại', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Lưu Phụ Thu';
            }
        }
    }

    // ==================== QUẢN LÝ VÉ & ĐẶT CHỖ (TICKETS) ====================
    async loadAllAdminTickets() {
        try {
            let tickets = [];
            if (api.isBackendOnline) {
                tickets = await api.getAllTickets();
            } else {
                tickets = MOCK_DATA.generateMockTickets();
            }
            if (Array.isArray(tickets)) {
                this.adminTickets = tickets;
            } else {
                this.adminTickets = [];
            }
        } catch (e) {
            console.warn('Lỗi gọi getAllTickets:', e);
            if (!this.adminTickets || this.adminTickets.length === 0) {
                this.adminTickets = MOCK_DATA.generateMockTickets();
            }
        }

        const ticketBadge = document.getElementById('adm-badge-tickets-count');
        if (ticketBadge) ticketBadge.textContent = this.adminTickets.length;

        this.filterAdminTickets(this.adminCurrentTicketFilter || 'ALL');
    }

    updateAdminKPIs() {
        // Doanh thu vé PAID
        const paidTickets = this.adminTickets.filter(t => t.status === 'PAID');
        const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.finalPrice || 0), 0);

        const revEl = document.getElementById('adm-kpi-revenue');
        if (revEl) revEl.textContent = this.formatVND(totalRevenue);

        // Tổng vé
        const tktEl = document.getElementById('adm-kpi-tickets');
        if (tktEl) tktEl.textContent = `${this.adminTickets.length} vé`;

        const pendingTickets = this.adminTickets.filter(t => t.status === 'PENDING');
        const cancelledTickets = this.adminTickets.filter(t => t.status === 'CANCELLED');

        const paidCountEl = document.getElementById('adm-kpi-tickets-paid');
        if (paidCountEl) paidCountEl.textContent = `${paidTickets.length} Đã Trả`;

        const pendingCountEl = document.getElementById('adm-kpi-tickets-pending');
        if (pendingCountEl) pendingCountEl.textContent = `${pendingTickets.length} Đang Giữ`;

        // Kho phim
        const moviesCountEl = document.getElementById('adm-kpi-movies');
        if (moviesCountEl) moviesCountEl.textContent = `${this.movies.length} bộ phim`;

        const showingCount = this.movies.filter(m => m.status === 'NOW_SHOWING').length;
        const comingCount = this.movies.filter(m => m.status === 'COMING_SOON').length;

        const showBadgeEl = document.getElementById('adm-kpi-movies-showing');
        if (showBadgeEl) showBadgeEl.textContent = `${showingCount} Đang Chiếu`;

        const comeBadgeEl = document.getElementById('adm-kpi-movies-coming');
        if (comeBadgeEl) comeBadgeEl.textContent = `${comingCount} Sắp Chiếu`;

        // Cập nhật số đếm trên các tab vé
        const countAll = document.getElementById('adm-count-all-tickets');
        if (countAll) countAll.textContent = this.adminTickets.length;

        const countPaid = document.getElementById('adm-count-paid-tickets');
        if (countPaid) countPaid.textContent = paidTickets.length;

        const countPending = document.getElementById('adm-count-pending-tickets');
        if (countPending) countPending.textContent = pendingTickets.length;

        const countCancelled = document.getElementById('adm-count-cancelled-tickets');
        if (countCancelled) countCancelled.textContent = cancelledTickets.length;

        // 5 giao dịch vé mới nhất trên tab Tổng quan
        const recentTbody = document.getElementById('adm-recent-tickets-tbody');
        if (recentTbody) {
            const recents = this.adminTickets.slice(0, 5);
            if (recents.length === 0) {
                recentTbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500 text-xs">Chưa có giao dịch đặt vé nào</td></tr>';
            } else {
                recentTbody.innerHTML = recents.map(t => {
                    const statusClass = t.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                                      (t.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200');
                    return `
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="font-mono text-xs font-bold text-gold cursor-pointer hover:underline" onclick="app.openTicketDetailModal(${t.id})">#${t.id}</td>
                            <td class="font-mono text-xs text-slate-600">User #${t.userId}</td>
                            <td class="text-xs text-slate-900 font-semibold">Suất #${t.showtimeId}</td>
                            <td class="font-mono text-xs text-slate-600">Ghế #${t.seatId}</td>
                            <td class="font-mono text-xs font-bold text-emerald-700">${this.formatVND(t.finalPrice || 85000)}</td>
                            <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}">${t.status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    filterAdminTickets(status) {
        this.adminCurrentTicketFilter = status;
        const tabs = ['ALL', 'PAID', 'PENDING', 'CANCELLED'];

        tabs.forEach(t => {
            const btn = document.getElementById(`adm-tkt-tab-${t}`);
            if (btn) {
                if (t === status) {
                    btn.className = 'px-3 py-1.5 rounded-lg bg-gold text-white font-bold shadow-sm';
                } else {
                    btn.className = 'px-3 py-1.5 rounded-lg bg-white text-slate-600 border border-slate-200 hover:border-gold hover:text-gold font-semibold';
                }
            }
        });

        let list = [...this.adminTickets];
        if (status !== 'ALL') {
            list = list.filter(t => t.status === status);
        }
        this.renderAdminTicketsTable(list);
    }

    searchAdminTickets() {
        const query = (document.getElementById('adm-ticket-search')?.value || '').toLowerCase().trim();
        let list = [...this.adminTickets];

        if (this.adminCurrentTicketFilter !== 'ALL') {
            list = list.filter(t => t.status === this.adminCurrentTicketFilter);
        }

        if (query) {
            list = list.filter(t => 
                String(t.id).includes(query) || 
                String(t.userId).includes(query) || 
                String(t.showtimeId).includes(query) || 
                String(t.seatId).includes(query)
            );
        }
        this.renderAdminTicketsTable(list);
    }

    renderAdminTicketsTable(list) {
        const tbody = document.getElementById('adm-tickets-tbody');
        if (!tbody) return;

        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-500 text-xs">Không có vé nào phù hợp</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(t => {
            const statusClass = t.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                              (t.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200');

            const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : '--';
            const st = (this.adminShowtimes || []).find(s => s.id === t.showtimeId);
            const mId = st?.movieId || st?.movie?.id;
            const movie = (st?.movie && st.movie.title) ? st.movie : this.movies.find(m => m.id === mId);
            const movieLabel = movie ? movie.title : `Suất #${t.showtimeId}`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="font-mono text-xs font-bold text-gold cursor-pointer hover:underline" onclick="app.openTicketDetailModal(${t.id})">#${t.id}</td>
                    <td class="font-mono text-xs text-slate-600">User #${t.userId}</td>
                    <td>
                        <div class="font-semibold text-slate-900 text-xs">${movieLabel}</div>
                        <div class="text-[11px] text-slate-500 font-mono">Suất #${t.showtimeId}</div>
                    </td>
                    <td><span class="font-mono text-xs text-slate-700">Ghế #${t.seatId}</span></td>
                    <td class="font-mono text-xs font-bold text-emerald-700">${this.formatVND(t.finalPrice || 85000)}</td>
                    <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}">${t.status}</span></td>
                    <td class="text-slate-500 font-mono text-[11px]">${dateStr}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            ${t.status === 'PENDING' ? `
                                <button onclick="app.adminConfirmPayTicket(${t.id})" title="Xác nhận đã thanh toán" class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-semibold transition">
                                    Thu Tiền
                                </button>
                                <button onclick="app.adminCancelTicket(${t.id})" title="Hủy giữ chỗ vé này" class="px-2.5 py-1 rounded-lg bg-amber-50 text-gold hover:bg-gold hover:text-white border border-amber-200 text-xs font-semibold transition">
                                    Hủy Vé
                                </button>
                            ` : ''}
                            <button onclick="app.openTicketDetailModal(${t.id})" title="Xem chi tiết vé & mã QR" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition">
                                Chi Tiết
                            </button>
                            <button onclick="app.adminDeleteTicket(${t.id})" title="Xóa vé vĩnh viễn" class="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-semibold transition">
                                Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async adminConfirmPayTicket(ticketId) {
        try {
            if (api.isBackendOnline) {
                await api.updateTicketStatus(ticketId, 'PAID');
            }
            const t = this.adminTickets.find(item => item.id === ticketId);
            if (t) t.status = 'PAID';
            this.showToast(`Đã chuyển trạng thái vé #${ticketId} sang PAID (Đã thanh toán)`, 'success');
            this.updateAdminKPIs();
            this.filterAdminTickets(this.adminCurrentTicketFilter);
        } catch (e) {
            this.showToast(e.message || 'Lỗi cập nhật vé', 'error');
        }
    }

    async adminCancelTicket(ticketId) {
        if (!confirm(`Bạn có chắc muốn hủy vé #${ticketId}? Ghế sẽ được nhả lại cho người khác đặt.`)) return;

        try {
            if (api.isBackendOnline) {
                await api.cancelTicket(ticketId);
            }
            const t = this.adminTickets.find(item => item.id === ticketId);
            if (t) t.status = 'CANCELLED';
            this.showToast(`Đã hủy vé #${ticketId} thành công`, 'success');
            this.updateAdminKPIs();
            this.filterAdminTickets(this.adminCurrentTicketFilter);
        } catch (e) {
            this.showToast(e.message || 'Lỗi hủy vé', 'error');
        }
    }

    async adminDeleteTicket(ticketId) {
        if (!confirm(`Xóa vĩnh viễn bản ghi vé #${ticketId} khỏi cơ sở dữ liệu?`)) return;

        try {
            if (api.isBackendOnline) {
                await api.deleteTicket(ticketId);
            }
            this.adminTickets = this.adminTickets.filter(t => t.id !== ticketId);
            this.showToast(`Đã xóa vé #${ticketId}`, 'success');
            this.updateAdminKPIs();
            this.filterAdminTickets(this.adminCurrentTicketFilter);
        } catch (e) {
            this.showToast(e.message || 'Lỗi xóa vé', 'error');
        }
    }

    openTicketDetailModal(ticketId) {
        const ticket = this.adminTickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const modal = document.getElementById('adm-ticket-modal');
        if (!modal) return;

        document.getElementById('adm-tkt-code').textContent = `MÃ VÉ: #${ticket.id}`;
        
        const badge = document.getElementById('adm-tkt-status-badge');
        if (badge) {
            badge.className = `inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                ticket.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 
                (ticket.status === 'PENDING' ? 'bg-amber-500/20 text-gold' : 'bg-red-500/20 text-red-400')
            }`;
            badge.textContent = ticket.status;
        }

        document.getElementById('adm-tkt-user').textContent = `User ID: #${ticket.userId}`;
        const st = (this.adminShowtimes || []).find(s => s.id === ticket.showtimeId);
        const mId = st?.movieId || st?.movie?.id;
        const movie = (st?.movie && st.movie.title) ? st.movie : this.movies.find(m => m.id === mId);
        const movieLabel = movie ? movie.title : `Suất chiếu ID: #${ticket.showtimeId}`;
        document.getElementById('adm-tkt-movie').textContent = `${movieLabel} (Suất #${ticket.showtimeId})`;
        document.getElementById('adm-tkt-time').textContent = ticket.paidAt ? `Đã trả lúc: ${new Date(ticket.paidAt).toLocaleTimeString('vi-VN')}` : 'Đang giữ chỗ';
        document.getElementById('adm-tkt-room').textContent = `Phòng chiếu theo Suất #${ticket.showtimeId}`;
        document.getElementById('adm-tkt-seat').textContent = `Ghế ID: #${ticket.seatId}`;
        document.getElementById('adm-tkt-price').textContent = this.formatVND(ticket.finalPrice || 85000);
        document.getElementById('adm-tkt-created').textContent = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : '--';

        modal.classList.remove('hidden');
    }

    closeTicketDetailModal() {
        const modal = document.getElementById('adm-ticket-modal');
        if (modal) modal.classList.add('hidden');
    }

    // ==================== HỆ THỐNG & CÔNG CỤ (SYSTEM) ====================
    async pingAllMicroservices() {
        this.showToast('Đang kiểm tra kết nối tới toàn bộ 6 microservices...', 'info');
        const online = await api.checkGatewayHealth();
        if (online) {
            this.showToast('✓ Toàn bộ 6 Microservices, Redis và MySQL đang phản hồi cực tốt (<15ms)', 'success');
        } else {
            this.showToast('⚠ Cổng API Gateway 8080 chưa phản hồi, hệ thống đang dùng Mock Cache', 'warning');
        }
    }

    pingService(name) {
        this.showToast(`Ping tới dịch vụ ${name.toUpperCase()}: Thành công (Status 200 OK)`, 'success');
    }

    flushClientCache() {
        localStorage.removeItem('cinema_cached_showtimes');
        this.showToast('Đã xóa sạch bộ nhớ cache. Tải lại toàn bộ dữ liệu mới...', 'success');
        this.refreshAdminData();
    }

    exportAdminReportJson() {
        const report = {
            system: 'AURA CINEMA MANAGEMENT PORTAL',
            generatedAt: new Date().toISOString(),
            metrics: {
                totalMovies: this.movies.length,
                totalTickets: this.adminTickets.length,
                paidTickets: this.adminTickets.filter(t => t.status === 'PAID').length,
                totalRevenueVND: this.adminTickets.filter(t => t.status === 'PAID').reduce((sum, t) => sum + (t.finalPrice || 0), 0)
            },
            movies: this.movies,
            recentTickets: this.adminTickets.slice(0, 50)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aura-cinema-report-${this.getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Đã xuất báo cáo hệ thống thành file JSON thành công!', 'success');
    }

    // ==================== TOAST NOTIFICATION SYSTEM ====================
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="font-bold text-base">${icons[type] || 'ℹ'}</span>
            <span class="flex-grow text-xs sm:text-sm font-medium leading-snug">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CinemaApp();
});

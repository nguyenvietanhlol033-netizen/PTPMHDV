/**
 * API Client kết nối với API Gateway (http://localhost:8080)
 * Hỗ trợ tự động gắn JWT Token, sinh Idempotency-Key, và xử lý mã lỗi chuẩn (401, 403, 409, 503).
 */

function resolveInitialApiBase() {
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        // Nếu mở trên cổng 3000 (Nginx container): dùng proxy '/api/v1' cùng origin không bị chặn CORS
        if (window.location.port === '3000' || window.location.port === '8080') {
            return '/api/v1';
        }
    }
    // Mở file:/// hoặc cổng khác: ưu tiên IPv4 127.0.0.1 để tránh timeout IPv6 của localhost trên Windows
    return 'http://127.0.0.1:8080/api/v1';
}

class ApiService {
    constructor() {
        this.tokenKey = 'cinema_jwt_token';
        this.userKey = 'cinema_user_info';
        this.isBackendOnline = false;
        this.baseUrl = resolveInitialApiBase();
    }

    // Quản lý Token & Thông tin User
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
            // Giải mã payload JWT cơ bản để lấy thông tin userId, username, role
            try {
                const parts = token.split('.');
                if (parts.length >= 2) {
                    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    const padded = payloadBase64.padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, '=');
                    const decodedJson = atob(padded);
                    const payload = JSON.parse(decodeURIComponent(escape(decodedJson)));
                    const userInfo = {
                        username: payload.sub || payload.username || 'User',
                        userId: payload.userId || payload.id || 1,
                        role: payload.role || 'CUSTOMER'
                    };
                    localStorage.setItem(this.userKey, JSON.stringify(userInfo));
                    return;
                }
            } catch (e) {
                console.warn('Không thể giải mã JWT payload:', e);
            }
            if (!localStorage.getItem(this.userKey)) {
                localStorage.setItem(this.userKey, JSON.stringify({ username: 'User', userId: 1, role: 'CUSTOMER' }));
            }
        } else {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (e) {
            console.warn('Lỗi thu hồi token phía server:', e);
        }
        this.setToken(null);
    }

    // Sinh UUID v4 làm Idempotency-Key chống đặt trùng vé
    generateIdempotencyKey() {
        return 'idem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    // Kiểm tra kết nối tới Gateway
    async checkGatewayHealth() {
        const candidates = [
            this.baseUrl,
            '/api/v1',
            'http://127.0.0.1:8080/api/v1',
            'http://localhost:8080/api/v1'
        ];
        const urls = [...new Set(candidates)];

        for (const base of urls) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const testUrl = `${base.replace(/\/+$/, '')}/movies/now-showing`;
                const res = await fetch(testUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok || (res.status >= 200 && res.status < 500)) {
                    this.baseUrl = base.replace(/\/+$/, '');
                    this.isBackendOnline = true;
                    return true;
                }
            } catch (e) {
                // Thử ứng viên tiếp theo
            }
        }
        this.isBackendOnline = false;
        return false;
    }

    // Hàm gọi API lõi
    async request(endpoint, options = {}) {
        const cleanBase = this.baseUrl.replace(/\/+$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = endpoint.startsWith('http') ? endpoint : `${cleanBase}${cleanEndpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Nếu 401: Chỉ logout khi gọi API cần xác thực bảo mật riêng
            if (response.status === 401) {
                if (token && (url.includes('/tickets') || url.includes('/users/'))) {
                    console.warn('Token đã hết hạn hoặc không hợp lệ');
                    this.logout();
                    if (window.app && typeof window.app.updateAuthUI === 'function') {
                        window.app.updateAuthUI();
                    }
                }
            }

            // Nếu 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            const contentType = response.headers.get('content-type');
            let data = null;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (typeof data === 'object' && data.message) 
                    ? data.message 
                    : (typeof data === 'string' ? data : `Lỗi ${response.status}`);
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (err) {
            throw err;
        }
    }

    // ==================== AUTH APIs ====================
    async register(username, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        const token = data?.accessToken || data?.token;
        if (token) {
            this.setToken(token);
            // Cập nhật thông tin username chính xác
            const currentUser = this.getCurrentUser() || {};
            currentUser.username = username;
            if (!currentUser.role) {
                currentUser.role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'CUSTOMER';
            }
            localStorage.setItem(this.userKey, JSON.stringify(currentUser));
        }
        return data;
    }

    // ==================== MOVIES APIs ====================
    async getNowShowing() {
        return this.request('/movies/now-showing');
    }

    async getComingSoon() {
        return this.request('/movies/coming-soon');
    }

    async getMovies(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/movies${query ? '?' + query : ''}`);
    }

    async getMovieById(id) {
        return this.request(`/movies/${id}`);
    }

    async createMovie(movieData) {
        return this.request('/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
    }

    async updateMovie(id, movieData) {
        return this.request(`/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(movieData)
        });
    }

    async deleteMovie(id) {
        return this.request(`/movies/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== SHOWTIMES APIs ====================
    async getShowtimes(movieId, date) {
        return this.request(`/showtimes?movieId=${movieId}&date=${date}`);
    }

    async getShowtimeById(id) {
        return this.request(`/showtimes/${id}`);
    }

    async createShowtime(data) {
        return this.request('/showtimes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteShowtime(id) {
        return this.request(`/showtimes/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== VENUES APIs ====================
    async getCinemas() {
        return this.request('/cinemas');
    }

    async createCinema(data) {
        return this.request('/cinemas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteCinema(id) {
        return this.request(`/cinemas/${id}`, {
            method: 'DELETE'
        });
    }

    async getSeatsByRoom(roomId) {
        return this.request(`/rooms/${roomId}/seats`);
    }

    async createRoom(data) {
        return this.request('/rooms', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async generateSeats(roomId, requestData) {
        return this.request(`/rooms/${roomId}/seats/generate`, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    }

    async patchSeat(seatId, patchData) {
        return this.request(`/seats/${seatId}`, {
            method: 'PATCH',
            body: JSON.stringify(patchData)
        });
    }

    // ==================== TICKETS / BOOKING APIs ====================
    async getOccupiedSeatsByShowtime(showtimeId) {
        return this.request(`/tickets/showtime/${showtimeId}/occupied-seats`);
    }

    async getShowtimeSeats(showtimeId) {
        return this.request(`/showtimes/${showtimeId}/seats`);
    }

    async bookTicket(showtimeId, seatId) {
        const idempotencyKey = this.generateIdempotencyKey();
        return this.request('/tickets', {
            method: 'POST',
            headers: {
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({ showtimeId, seatId })
        });
    }

    async bookTicketBatch(showtimeId, seatIds) {
        const idempotencyKey = this.generateIdempotencyKey();
        return this.request('/tickets/batch', {
            method: 'POST',
            headers: {
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({ showtimeId, seatIds })
        });
    }

    async getMyTickets() {
        return this.request('/tickets/my-tickets');
    }

    async getTicketById(id) {
        return this.request(`/tickets/${id}`);
    }

    async payTicket(id) {
        return this.request(`/tickets/${id}/pay`, {
            method: 'POST'
        });
    }

    async cancelTicket(id) {
        return this.request(`/tickets/${id}/cancel`, {
            method: 'POST'
        });
    }

    async getAllTickets() {
        return this.request('/tickets');
    }

    async updateTicketStatus(id, status) {
        return this.request(`/tickets/${id}/status?status=${encodeURIComponent(status)}`, {
            method: 'PATCH'
        });
    }

    // ==================== PRICING CONFIG APIs (ADMIN) ====================
    async getPricing() {
        return this.request('/tickets/pricing');
    }

    async updatePricing(vipSurcharge, sweetboxSurcharge) {
        return this.request('/tickets/pricing', {
            method: 'PUT',
            body: JSON.stringify({ vipSurcharge, sweetboxSurcharge })
        });
    }

    async deleteTicket(id) {
        return this.request(`/tickets/${id}`, {
            method: 'DELETE'
        });
    }
}

// Khởi tạo Singleton Instance
window.api = new ApiService();

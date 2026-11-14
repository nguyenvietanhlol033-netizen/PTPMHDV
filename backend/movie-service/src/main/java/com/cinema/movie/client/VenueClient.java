package com.cinema.movie.client;

import com.cinema.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Gọi sang venue-service để kiểm tra phòng chiếu tồn tại (có timeout + retry + fallback 503).
 */
@Component
public class VenueClient {

    private final RestClient restClient;
    private final RemoteCaller remote;

    public VenueClient(@Value("${services.venue.url:http://localhost:8083}") String baseUrl, RemoteCaller remote) {
        this.remote = remote;
        this.restClient = remote.newClient(baseUrl);
    }

    public Map<String, Object> getRoom(Long roomId) {
        return remote.get("venue-service", () -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.get()
                        .uri("/api/v1/rooms/{id}", roomId)
                        .retrieve()
                        .body(Map.class);
                return response;
            } catch (HttpClientErrorException.NotFound e) {
                throw new ResourceNotFoundException("Không tìm thấy Phòng chiếu với ID: " + roomId);
            } catch (HttpClientErrorException e) {
                throw new IllegalStateException("venue-service trả lỗi " + e.getStatusCode().value());
            }
        });
    }
}

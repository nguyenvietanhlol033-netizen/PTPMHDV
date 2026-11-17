package com.cinema.booking.client;

import com.cinema.booking.dto.SeatInfo;
import com.cinema.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;

// Gọi sang venue-service (có timeout + retry + fallback 503)
@Component
public class SeatClient {

    private final RestClient restClient;
    private final RemoteCaller remote;

    public SeatClient(@Value("${services.venue.url}") String baseUrl, RemoteCaller remote) {
        this.remote = remote;
        this.restClient = remote.newClient(baseUrl);
    }

    public SeatInfo getSeat(Long seatId) {
        return remote.get("venue-service", () -> {
            try {
                return restClient.get()
                        .uri("/api/v1/seats/{id}", seatId)
                        .retrieve()
                        .body(SeatInfo.class);
            } catch (HttpClientErrorException.NotFound e) {
                throw new ResourceNotFoundException("Không tìm thấy Ghế");
            } catch (HttpClientErrorException e) {
                throw new IllegalStateException("venue-service trả lỗi " + e.getStatusCode().value());
            }
        });
    }

    public List<SeatInfo> getSeatsByRoom(Long roomId) {
        return remote.get("venue-service", () -> {
            try {
                return restClient.get()
                        .uri("/api/v1/rooms/{id}/seats", roomId)
                        .retrieve()
                        .body(new ParameterizedTypeReference<List<SeatInfo>>() {});
            } catch (HttpClientErrorException.NotFound e) {
                throw new ResourceNotFoundException("Không tìm thấy Phòng chiếu");
            } catch (HttpClientErrorException e) {
                throw new IllegalStateException("venue-service trả lỗi " + e.getStatusCode().value());
            }
        });
    }

    public void updateSeatStatus(Long seatId, String status) {
        if (seatId == null || status == null) return;
        try {
            restClient.patch()
                    .uri("/api/v1/seats/{id}", seatId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(java.util.Collections.singletonMap("status", status))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SeatClient.class)
                    .warn("Không thể đồng bộ trạng thái ghế #{} sang {}: {}", seatId, status, e.getMessage());
        }
    }
}

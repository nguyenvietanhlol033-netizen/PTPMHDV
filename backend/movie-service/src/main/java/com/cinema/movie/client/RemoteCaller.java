package com.cinema.movie.client;

import com.cinema.common.client.RetryExecutor;
import com.cinema.common.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.function.Supplier;

/**
 * Cấu hình gọi service-to-service từ movie-service sang venue-service:
 *  - Timeout kết nối / đọc: tránh treo thread.
 *  - Retry: thử lại với lỗi mạng, timeout, HTTP 5xx.
 *  - Fallback: ném ServiceUnavailableException (503) khi venue-service không phản hồi.
 */
@Component
public class RemoteCaller {
    private static final Logger log = LoggerFactory.getLogger(RemoteCaller.class);

    private final int connectTimeoutMs;
    private final int readTimeoutMs;
    private final int maxAttempts;
    private final long backoffMs;

    public RemoteCaller(@Value("${services.timeout.connect-ms:2000}") int connectTimeoutMs,
                        @Value("${services.timeout.read-ms:3000}") int readTimeoutMs,
                        @Value("${services.retry.max-attempts:3}") int maxAttempts,
                        @Value("${services.retry.backoff-ms:200}") long backoffMs) {
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
        this.maxAttempts = maxAttempts;
        this.backoffMs = backoffMs;
    }

    public RestClient newClient(String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    public static boolean isRetryable(RuntimeException e) {
        return e instanceof ResourceAccessException || e instanceof HttpServerErrorException;
    }

    public <T> T get(String serviceName, Supplier<T> call) {
        return RetryExecutor.execute(call, RemoteCaller::isRetryable, maxAttempts, backoffMs, last -> {
            log.warn("{} không phản hồi sau {} lần thử: {}", serviceName, maxAttempts, last.toString());
            throw new ServiceUnavailableException(
                    serviceName + " tạm thời không khả dụng, vui lòng thử lại sau", last);
        });
    }
}

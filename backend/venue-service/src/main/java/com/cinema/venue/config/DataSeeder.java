package com.cinema.venue.config;

import com.cinema.venue.model.Cinema;
import com.cinema.venue.model.Room;
import com.cinema.venue.model.Seat;
import com.cinema.venue.model.SeatStatus;
import com.cinema.venue.model.SeatType;
import com.cinema.venue.repository.CinemaRepository;
import com.cinema.venue.repository.RoomRepository;
import com.cinema.venue.repository.SeatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "cinema.demo-data.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;

    public DataSeeder(CinemaRepository cinemaRepository, RoomRepository roomRepository, SeatRepository seatRepository) {
        this.cinemaRepository = cinemaRepository;
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    public void run(String... args) {
        if (cinemaRepository.count() > 0) {
            return;
        }

        // 1. Rạp 1: Landmark Grand (TP.HCM)
        Cinema c1 = new Cinema();
        c1.setName("AURA CINEMA - Landmark Grand");
        c1.setAddress("Tầng 5, Vincom Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM");
        cinemaRepository.save(c1);

        // 2. Rạp 2: Royal City (Hà Nội)
        Cinema c2 = new Cinema();
        c2.setName("AURA CINEMA - Royal City");
        c2.setAddress("Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội");
        cinemaRepository.save(c2);

        // 3. Rạp 3: Sài Gòn Centre (TP.HCM)
        Cinema c3 = new Cinema();
        c3.setName("AURA CINEMA - Sài Gòn Centre");
        c3.setAddress("Tầng 4, Sài Gòn Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM");
        cinemaRepository.save(c3);

        // Tạo 3 phòng chiếu cho Rạp 1 tương ứng roomId: 1, 2, 3
        Room room1 = new Room();
        room1.setName("Phòng chiếu 01 (IMAX Laser)");
        room1.setCapacity(60);
        room1.setCinema(c1);
        roomRepository.save(room1);

        Room room2 = new Room();
        room2.setName("Phòng chiếu 02 (Dolby Atmos)");
        room2.setCapacity(60);
        room2.setCinema(c1);
        roomRepository.save(room2);

        Room room3 = new Room();
        room3.setName("Phòng chiếu 03 (Gold Class)");
        room3.setCapacity(60);
        room3.setCinema(c1);
        roomRepository.save(room3);

        // Tạo 3 phòng chiếu cho Rạp 2 tương ứng roomId: 4, 5, 6
        Room room4 = new Room();
        room4.setName("Phòng chiếu 01 (Starium 3D)");
        room4.setCapacity(60);
        room4.setCinema(c2);
        roomRepository.save(room4);

        Room room5 = new Room();
        room5.setName("Phòng chiếu 02 (Dolby 7.1)");
        room5.setCapacity(60);
        room5.setCinema(c2);
        roomRepository.save(room5);

        Room room6 = new Room();
        room6.setName("Phòng VIP Lounge (Royal City)");
        room6.setCapacity(60);
        room6.setCinema(c2);
        roomRepository.save(room6);

        // Tạo 3 phòng chiếu cho Rạp 3 tương ứng roomId: 7, 8, 9
        Room room7 = new Room();
        room7.setName("Phòng chiếu 01 (ScreenX 270°)");
        room7.setCapacity(60);
        room7.setCinema(c3);
        roomRepository.save(room7);

        Room room8 = new Room();
        room8.setName("Phòng chiếu 02 (Dolby Atmos)");
        room8.setCapacity(60);
        room8.setCinema(c3);
        roomRepository.save(room8);

        Room room9 = new Room();
        room9.setName("Phòng chiếu 03 (L'amour Giường Nằm)");
        room9.setCapacity(60);
        room9.setCinema(c3);
        roomRepository.save(room9);

        // Tạo sơ đồ ghế chuẩn cho tất cả 9 phòng chiếu
        createSeatGrid(room1);
        createSeatGrid(room2);
        createSeatGrid(room3);
        createSeatGrid(room4);
        createSeatGrid(room5);
        createSeatGrid(room6);
        createSeatGrid(room7);
        createSeatGrid(room8);
        createSeatGrid(room9);

        System.out.println("====== VENUE-SERVICE: ĐÃ TẠO 3 CỤM RẠP, 9 PHÒNG CHIẾU VÀ 540 GHẾ NGỒI THỰC TẾ ======");
    }

    private void createSeatGrid(Room room) {
        List<Seat> seats = new ArrayList<>();
        char[] rowChars = {'A', 'B', 'C', 'D', 'E', 'F'};

        for (int r = 0; r < rowChars.length; r++) {
            char rowChar = rowChars[r];
            SeatType type;
            if (r < 2) {
                type = SeatType.STANDARD; // Hàng A, B: Ghế thường
            } else if (r < 5) {
                type = SeatType.VIP;      // Hàng C, D, E: Ghế VIP
            } else {
                type = SeatType.SWEETBOX; // Hàng F: Ghế đôi ngọt ngào
            }

            for (int col = 1; col <= 10; col++) {
                Seat seat = new Seat();
                seat.setSeatName("" + rowChar + col);
                seat.setSeatType(type);
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setRoom(room);
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
    }
}

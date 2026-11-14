/**
 * Mock Data cập nhật đầy đủ 37 phim từ Beta Cinemas (TTphim)
 * Hỗ trợ chế độ Demo Mode và dự phòng khi Backend chưa khởi động
 */
window.MOCK_DATA = {
    cinemas: [
        { id: 1, name: "AURA CINEMA - Landmark Grand", address: "Tầng 5, Vincom Landmark 81, Bình Thạnh, TP.HCM" },
        { id: 2, name: "AURA CINEMA - Royal City", address: "Tầng B2, Vincom Mega Mall Royal City, Thanh Xuân, Hà Nội" },
        { id: 3, name: "AURA CINEMA - Sài Gòn Centre", address: "Tầng 4, 65 Lê Lợi, Quận 1, TP.HCM" }
    ],
    rooms: [
        { id: 1, name: "Phòng chiếu 01 (IMAX Laser)", totalSeats: 60, cinemaId: 1 },
        { id: 2, name: "Phòng chiếu 02 (Dolby Atmos)", totalSeats: 60, cinemaId: 1 },
        { id: 3, name: "Phòng chiếu 03 (Gold Class)", totalSeats: 60, cinemaId: 1 }
    ],
    movies: [
    {
        "id":  1,
        "title":  "Chị Chị Em Em 3",
        "genre":  "Tâm lý, Tình cảm",
        "releaseYear":  2026,
        "durationMinutes":  122,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f08%2f400x633%2D101304%2D081026%2D10.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Nguyễn Hữu Hoàng",
        "actors":  "Kỳ Duyên, Steven Nguyễn, Chi Pu, Quốc Anh, Ninh Dương Lan Ngọc, NSND Lê Khanh...",
        "trailer":  "https://www.youtube.com/watch?v=0kXa2Zdu-oI",
        "releaseDate":  "30/10/2026",
        "description":  "Giữa xã hội Bắc Bộ cũ đầy lễ giáo, Văn Tài - công tử con quan lớn quyền thế - chuẩn bị cưới Thị Mầu, tiểu thư nổi tiếng tài sắc nhất vùng. Tưởng đây là cuộc hôn nhân môn đăng hộ đối được cả làng mong chờ, nhưng trớ trêu thay Văn Tài lại say đắm Thị Liễu - người chị họ đến từ phương Nam của Thị Mầu, đang tìm đường thoát khỏi cuộc hôn nhân ngột ngạt với người chồng gia trưởng Văn Cường. Bên cạnh đó, Văn Tài còn nợ Thị Nương một mối tình chưa tròn, để rồi một cuộc tình tay năm bùng nổ, cuốn tất cả vào một cuộc chiến không ai toàn thắng - vì ở đó, tình yêu và danh dự không thể cùng tồn tại."
    },
    {
        "id":  2,
        "title":  "Godzilla Trừ Không",
        "genre":  "Hành động",
        "releaseYear":  2026,
        "durationMinutes":  135,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f11%2f02%2f852x1292%2D114213%2D021126%2D52.png",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Takashi Yamazaki",
        "actors":  "Ryunosuke Kamiki, Minami Hamabe, Min Tanaka, Hidetaka Yoshioka",
        "trailer":  "https://www.youtube.com/watch?v=k7MFvPQ__Ww",
        "releaseDate":  "06/11/2026",
        "description":  "Chiến tranh đã đưa Nhật Bản về con số 0, Godzilla đã kéo con số ấy lao dốc xuống số âm. Đã hai năm kể từ cuộc chiến, đất nước đang đấu tranh để phục hồi và họ cuối cùng đã lấy lại được cuộc sống thường nhật. Ngay khi nhân loại cố bám giữ sự yên bình mong manh vừa giành lại được, thì một mối đe dọa mới xuất hiện, nghiền nát tất cả hy vọng. Không còn cơ hội nào nữa. Tất cả sẽ kết thúc tại đây."
    },
    {
        "id":  3,
        "title":  "Bò Sữa Bay",
        "genre":  "Tình cảm, Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  108,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f02%2fteaser%2Dposter%2Dbsb%2Ddigital%2D2%2D154953%2D021026%2D89.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Nguyễn Phạm Thành Đạt",
        "actors":  "Nguyễn Hùng, Ngọc Xuân, Tiểu Vy, Võ Điền Gia Huy, Lãnh Thanh...",
        "trailer":  "https://www.youtube.com/watch?v=inpNGLjC1dY",
        "releaseDate":  "06/11/2026",
        "description":  "Lấy bối cảnh thập niên 70–80, phim xoay quanh một trang trại đang nghiên cứu công thức sữa “bí mật” có khả năng chữa lành và trẻ hóa."
    },
    {
        "id":  4,
        "title":  "Ramayana: Khởi Nguồn Một Huyền Thoại",
        "genre":  "Hành động, Thần thoại",
        "releaseYear":  2026,
        "durationMinutes":  168,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f12%2frama%2Dintl%2Donline%2D1080x1350%2Dtsr%2D04%2D114806%2D121026%2D98.jpg",
        "ageRating":  "C13",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Nitesh Tiwari",
        "actors":  "Ranbir Kapoor, Sai Pallavi, Yash, Sunny Deol, Kajal Aggarwal",
        "trailer":  "https://www.youtube.com/watch?v=bBFOm2HJM14",
        "releaseDate":  "06/11/2026",
        "description":  "Rama, hoàng tử của vương quốc Ayodhya, hiện thân của vị thần Vishnu, người vốn được chọn để kế vị nhưng phải rời cung điện và sống lưu vong 14 năm vì lời hứa của cha mình. Vợ của Rama là Sita và em trai Lakshmana cùng ông vào  rừng. Trong thời gian lưu vong, Sita bị Ravana, vị vua Dạ Xoa quyền năng siêu nhiên của Vương quốc Lanka, bắt cóc. Rama bắt đầu hành trình tìm kiếm và giải cứu nàng, trên đường kết bạn với Thần khỉ Hanuman cùng đội quân Vanara."
    },
    {
        "id":  5,
        "title":  "Thiên Đường Tăm Tối",
        "genre":  "Tâm lý, Giật gân",
        "releaseYear":  2026,
        "durationMinutes":  100,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f26%2fpl%2Dmain%2Dposter%2Dsocial%2D101233%2D261026%2D64.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Yeon Sang-ho",
        "actors":  "Kim Hyun-joo, Bae Hyeon-seong",
        "trailer":  "https://www.youtube.com/watch?v=VRJ9GmL8fak",
        "releaseDate":  "06/11/2026",
        "description":  "Thiên Đường Tăm Tối xoay quanh hành trình bi thương của So-young - một người mẹ bất ngờ mất đi đứa con của mình. Giữa nỗi đau tận cùng, So-young tìm thấy niềm an ủi khi kết nối với hình ảnh cậu con trai Sun-woo đã mất tích thông qua kính AR. Chín năm sau, điều tưởng như không thể xảy ra: Sun-woo thật sự trở về, nay đã là một chàng trai trưởng thành. Thế nhưng, cuộc đoàn tụ không mang đến hạnh phúc mà một lần nữa đẩy So-young vào tuyệt vọng khi người con trai trở về giờ đây xa lạ và lạnh lùng, trong khi phiên bản Sun-woo ảo lại ngày càng cần đến cô, buộc cô phải đối diện với lựa chọn đau đớn giữa thực tại và một thế giới được tạo nên từ ký ức."
    },
    {
        "id":  6,
        "title":  "Khi Thần Chết Đổ Chuông",
        "genre":  "Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  86,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f29%2fktcdc%2Dmain%2Dsocial%2D114538%2D291026%2D12.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Jay Sukmo",
        "actors":  "Bhisma Mulia, Ratu Sofya, Givina, Shaloom Razade, Mathias Muchus, Maulidan Zuhri",
        "trailer":  "https://www.youtube.com/watch?v=ddeb9SNcqNU",
        "releaseDate":  "06/11/2026",
        "description":  "Khi Thần Chết Đổ Chuông xoay quanh Danto (Bhisma Mulia) – người đàn ông trở về quê nhà sau nhiều năm xa cách, sau khi hay tin ông mình, pháp sư Baharun, bị sát hại bởi Panebok – linh hồn không đầu gieo rắc nỗi kinh hoàng tại vùng đất Belitung. \nKhi chiếc chuông thiêng vốn dùng để phong ấn những linh hồn bị chiếm giữ, hàng loạt vụ giết người bí ẩn liên tiếp xảy ra. Các nạn nhân bị chặt đầu, còn truyền thuyết kinh hoàng tưởng chừng chỉ dùng để dọa trẻ con dần trở thành cơn ác mộng hiện hữu. Để ngăn chặn thảm kịch tiếp diễn, Danto buộc phải đối mặt với bí mật gia đình và tìm cách phong ấn Panebok, trước khi linh hồn không đầu này giải phóng hàng loạt linh hồn bị giam cầm bên trong chiếc chuông."
    },
    {
        "id":  7,
        "title":  "Chàng Mèo Mang Mũ",
        "genre":  "Gia đình, Hoạt hình",
        "releaseYear":  2026,
        "durationMinutes":  107,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f29%2fposter%2Dchang%2Dmeo%2Dmang%2Dmu%2D1%2D110920%2D290926%2D90.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Alessandro Carloni, Erica Rivinoja",
        "actors":  "Bill Hader, Xochitl Gomez, Matt Berry, Quinta Brunson, Paula Pell,...",
        "trailer":  "https://www.youtube.com/watch?v=gXdNytoxe88",
        "releaseDate":  "06/11/2026",
        "description":  "Hãy gặp gỡ Chàng Mèo Mang Mũ theo cách bạn chưa từng biết đến! Tiếp nối tinh thần kỳ diệu và đầy trí tưởng tượng trong các tác phẩm của Dr. Seuss, The Cat in the Hat chính thức bước lên màn ảnh rộng với bộ phim hoạt hình điện ảnh đầu tiên của mình – một cuộc phiêu lưu hoàn toàn mới, hoành tráng và đầy cá tính, nơi những trò tinh nghịch, phép màu và hỗn loạn ngự trị. Trong phim, nhân vật chính của chúng ta phải đối mặt với nhiệm vụ khó khăn nhất từ trước đến nay cho I.I.I.I. (Viện Phụ trách Trí tưởng tượng và Cảm hứng, LLC): giúp Gabby và Sebastian, hai anh em đang chật vật thích nghi với cuộc sống ở một thị trấn mới, tìm lại niềm vui. Nổi tiếng với việc thường xuyên đẩy mọi thứ đi quá xa, đây có thể là cơ hội cuối cùng để “đặc vụ hỗn loạn” này chứng minh bản thân... hoặc đánh mất chiếc mũ phép thuật của mình!"
    },
    {
        "id":  8,
        "title":  "Clayface",
        "genre":  "Hồi Hộp, Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  109,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f17%2fvn%2Dclay%2Dinsta%2Dvert%2Dmain%2D1638x2048%2Dintl%2D115700%2D170926%2D97.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "James Watkins",
        "actors":  "Tom Rhys Harries, Naomi Ackie, David Dencik, Max Minghella, Eddie Marsan, Nancy Carroll, Joshua James,...",
        "trailer":  "https://www.youtube.com/watch?v=deaBjWyrZWo",
        "releaseDate":  "30/10/2026",
        "description":  "Bộ phim kinh dị đầu tiên của DC Studios, “Clayface” do đạo diễn James Watkins thực hiện, với sự tham gia của Tom Rhys Harries trong vai chính, một nhân vật phản diện của thành phố Gotham. “Clayface” hé lộ sự sa ngã kinh hoàng của một người đàn ông từ ngôi sao Hollywood đang lên trở thành một con quái vật đầy thù hận, trong một câu chuyện khám phá sự mất mát bản sắc và nhân tính, tình yêu độc hại, và mặt tối của tham vọng khoa học."
    },
    {
        "id":  9,
        "title":  "Án Mạng Karaoke",
        "genre":  "Trinh thám, Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  96,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f19%2f261026%2Dan%2Dmang%2Dkaraoke%2D154426%2D191026%2D19.jpg",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Hoàng Lê",
        "actors":  "Đoàn Thiên Ân, Đại Nghĩa, Vân Dung, Thanh Sơn, Quỳnh Lý, Tạ Lâm, Trịnh Thảo, Minh Tuyền, Tiểu Bảo Quốc, Phương Dung, Uy Nhân và một số diễn viên khác",
        "trailer":  "https://www.youtube.com/watch?v=aV4qtcKmkQo",
        "releaseDate":  "26/10/2026",
        "description":  "Một người hàng xóm mê hát karaoke bất ngờ bị sát hại trong căn homestay thiền biệt lập trên núi, khiến chuyến hành hương của một xóm nhỏ bị biến thành trò chơi đầu trí bất đắc dĩ."
    },
    {
        "id":  10,
        "title":  "Trại Buôn Người",
        "genre":  "Hành động, Tâm lý",
        "releaseYear":  2026,
        "durationMinutes":  135,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f15%2fofficial%2Dposter%2Dtrai%2Dbuon%2Dnguoi%2Dfinal%2D142318%2D150926%2D62.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Toni Dương Bảo Anh",
        "actors":  "Steven Nguyễn, Quách Ngọc Ngoan, NSND Như Quỳnh, NSƯT Tuyết Thu, Long Điền...",
        "trailer":  "https://www.youtube.com/watch?v=TUzx32ejTlY",
        "releaseDate":  "25/09/2026",
        "description":  "Vì cứu em gái sa bẫy buôn người ở biên giới miền Tây, Ny (Steven Nguyễn) cùng bạn thân bị bắt làm nô dịch trong sào huyệt lừa đảo tàn bạo.\n\nTại đây, họ cùng các trinh sát nằm vùng và các nạn nhân hứng chịu bi kịch thể xác âm thầm lập kế hoạch trốn thoát."
    },
    {
        "id":  11,
        "title":  "Lên Hương",
        "genre":  "Tâm lý, Gia đình",
        "releaseYear":  2026,
        "durationMinutes":  121,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f08%2f31%2flh%2Dposter%2Dpay%2Doff%2D01%2Dgreen%2Dw70xh100%2D102352%2D310826%2D82.jpg",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Khương Ngọc và Tấn Hoàng Thông",
        "actors":  "Hồng Đào, Võ Tấn Phát, NSƯT Tuyết Thu, NSND Hồng Vân, Hạ Anh, Quốc Khánh, Thiếu Lan",
        "trailer":  "https://www.youtube.com/watch?v=gdBx_SzNO8Q",
        "releaseDate":  "14/09/2026",
        "description":  "Một bà chủ của trại hòm ế ẩm và một thanh niên cần tiền trang trải cuộc sống đã vô tình mắc vào một “giao kèo định mệnh\"\nMột người cố giữ nghề, một người cố cứu mạng người mẹ đang bệnh nặng, mở ra bí mật về món nợ đã chôn vùi suốt nhiều năm."
    },
    {
        "id":  12,
        "title":  "Phim Điện Ảnh Về Bộ Đôi Anh Hùng 2026: Kamen Rider ZEZTZ \u0026 Siêu Cảnh sát Vũ trụ GAVAN INFINITY",
        "genre":  "Khoa học, viễn tưởng",
        "releaseYear":  2026,
        "durationMinutes":  96,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f15%2fkamen%2Drider%2Dzeztzandgavan%2Dlocalized%2Dmain%2Dadaptation%2Dweb%2D400%2Dx%2D633%2D113708%2D151026%2D17.png",
        "ageRating":  "K",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Kazuya Kamihoriuchi, Hirofumi Fukuzawa",
        "actors":  "Ryutaro Imai, Maho Horiguchi, Kenta Mishima, Rina Onuki",
        "trailer":  "https://www.youtube.com/watch?v=IvRFf7uoIsQ",
        "releaseDate":  "30/10/2026",
        "description":  "Trụ sở Cảnh sát Quốc gia bị đánh bom, Yorozu Baku (Zeztz) trở thành nghi phạm số một và bị truy nã toàn quốc. Odaka Kensei (Nox) quyết tâm tìm ra kẻ đứng sau – Kamen Rider Mugen. Cùng sát cánh, Zeztz và Nox đối đầu Mugen, nhưng bị áp đảo bởi năng lực “Mộng giữa Ban ngày” có thể thao túng thực tại. Baku buộc phải đưa ra quyết định tàn khốc.\nMặt Trời của Trái Đất Đa Nguyên A0073 bị Không Gian Ma Giới nuốt chửng, đổi lại kẻ thù yêu cầu mạng Gavan. Reiji bàng hoàng phát hiện Gavan Killer chính là Hase Makoto, tiền bối anh kính trọng. Khi Reiji rơi vào tuyệt vọng, các Gavan từ khắp đa chiều không gian đồng loạt hội tụ, mở màn trận chiến đa vũ trụ nhằm vạch trần âm mưu thực sự."
    },
    {
        "id":  13,
        "title":  "Shaun The Sheep: \"Quái Lạ\" Ghé Nhà",
        "genre":  "Hoạt hình",
        "releaseYear":  2026,
        "durationMinutes":  81,
        "status":  "NOW_SHOWING",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f05%2f161026%2Dshaun%2Dthe%2Dsheep%2D152403%2D051026%2D14.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Steve Cox, Matthew Walker",
        "actors":  "Đang cập nhật",
        "trailer":  "https://www.youtube.com/watch?v=8q6XZq8a0iA",
        "releaseDate":  "16/10/2026",
        "description":  "SHAUN THE SHEEP: “QUÁI LẠ” GHÉ NHÀ bắt đầu với sự cố Ông chủ vô tình phá hỏng vườn bí ngô mà đàn cừu đang chuẩn bị cho Halloween. Để cứu vãn tình hình, Shaun trổ tài làm “nhà khoa học”, nhưng thí nghiệm lại kéo theo hàng loạt rắc rối ngoài dự tính. Khi Ông chủ mất tích và một sinh vật bí ẩn xuất hiện trong rừng, cả đàn cừu lên đường tìm kiếm Ông chủ và đối mặt với một chuyến phiêu lưu vừa quái vừa nhộn."
    },
    {
        "id":  14,
        "title":  "Mẹ Mìn",
        "genre":  "Hồi hộp, Ly kì",
        "releaseYear":  2026,
        "durationMinutes":  112,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f27%2fme%2Dmin%2Dkc%2D27%2D11%2D2026%2Dkt%2Dchuan%2D114058%2D271026%2D12.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Jack Carry On",
        "actors":  "Minh Hằng, Nhật Kim Anh, Rima Thanh Vy, Khương Lê, Đại Nghĩa, Bé Tư, Phát La",
        "trailer":  "https://www.youtube.com/watch?v=mTylSVV6zSo",
        "releaseDate":  "27/11/2026",
        "description":  "MẸ MÌN – một nhân vật bí ẩn – có khả năng ban phát điều ước cho mọi người, nhưng điều ước nào cũng sẽ đi kèm điều kiện của nó."
    },
    {
        "id":  15,
        "title":  "Ngày Con Còn Mẹ",
        "genre":  "Gia đình, Tâm lý",
        "releaseYear":  2026,
        "durationMinutes":  107,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f19%2f111126%2Dngay%2Dcon%2Dcon%2Dme%2D111402%2D191026%2D11.jpg",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Vũ Ngọc Đãng",
        "actors":  "Hồng Đào, Phương Anh Đào, Marando, Nguyên Thảo, Huy Anh",
        "trailer":  "https://www.youtube.com/watch?v=Z034KYinREo",
        "releaseDate":  "11/11/2026",
        "description":  "Có những đứa con dành cả tuổi thơ chỉ để chứng minh mình xứng đáng được yêu thương. Và cũng có những người mẹ dành cả đời để yêu con theo cách mà con chẳng thể nào hiểu nổi.\nMây lớn lên với niềm tin sắt đá rằng trong tim bà Tím, anh Hai Pháo luôn là tất cả. Nỗi đau bị \"bỏ quên\" khiến cô biến mọi câu chuyện thành tranh cãi, dựng nên bức tường im lặng giữa hai mẹ con. Cho đến khi biến cố bất ngờ ập xuống, Mây mới bàng hoàng nhận ra: điều đau đớn nhất không phải là chưa từng được yêu, mà là cô đã dành trọn thanh xuân để trách một người mẹ... mà chưa từng thật sự hiểu bà.\nKhai thác góc nhìn chân thật về \"đứa con thừa\", NGÀY CON CÒN MẸ là hành trình dằn xé nhưng ấm áp, nhắc nhở chúng ta học cách tha thứ và yêu thương khi mọi thứ vẫn còn kịp"
    },
    {
        "id":  16,
        "title":  "Bí Kíp Luyện Cướp",
        "genre":  "Hành động, Tội Phạm",
        "releaseYear":  2026,
        "durationMinutes":  122,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f12%2f131126%2Dbi%2Dkip%2Dluyen%2Dcuop%2D115741%2D121026%2D67.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "David Leitch",
        "actors":  "Nicholas Hoult, Zoe Kravitz, Anna Sawai, Rhenzy Feliz, Pete Davidson",
        "trailer":  "https://www.youtube.com/watch?v=EPIRfant4y4",
        "releaseDate":  "13/11/2026",
        "description":  "Một nhóm cướp ngân hàng am hiểu mạng xã hội phát sóng những vụ cướp táo bạo của chúng, mà không hề hay biết rằng sự nổi tiếng lan truyền nhanh chóng đã đưa chúng vào tầm ngắm của một đặc vụ FBI kỳ cựu và một kỹ sư phần mềm tài ba. Mặc dù bộ đôi bất đắc dĩ này đang tiến gần, băng nhóm tội phạm vẫn vượt qua giới hạn của mình, đặt mọi thứ vào rủi ro vì niềm tin của chúng - và vụ cướp tham vọng nhất từ ​​trước đến nay."
    },
    {
        "id":  17,
        "title":  "Ebenezer Phép Màu Đêm Giáng Sinh",
        "genre":  "Thần thoại",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f29%2f131126%2Dphep%2Dmau%2Ddem%2Dgiang%2Dsinh%2D105105%2D290926%2D49.png",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Ti West",
        "actors":  "Johnny Depp, Rupert Grint, Andrea Riseborough, Sam Claflin, and Ian McKellen",
        "trailer":  "https://www.youtube.com/watch?v=2dITfFDPxMA",
        "releaseDate":  "13/11/2026",
        "description":  "Tháng 11 này, Johnny Depp sẽ hóa thân thành Ebenezer Scrooge. Một cái tên quen thuộc và một câu chuyện chưa từng được kể."
    },
    {
        "id":  18,
        "title":  "Kẻ Hồi Sinh",
        "genre":  "Hành động",
        "releaseYear":  2026,
        "durationMinutes":  101,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f29%2fposter%2D110730%2D291026%2D27.jpg",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Jong-Yeol Baek",
        "actors":  "Koo Kyo-hwan; Shin Seung-ho; Kang Ki-young;...",
        "trailer":  "https://www.youtube.com/watch?v=xYCXTTxsBpA",
        "releaseDate":  "13/11/2026",
        "description":  "Dựa trên bộ webtoon hành động đình đám, KẺ HỒI SINH (Reawakened Man) đánh dấu màn hóa thân gai góc của Koo Kyo-Hwan với những trận combat nghẹt thở.\nChỉ cần 72 giờ, tất cả mọi thứ sẽ được thiết lặp lại. 72 giờ không chỉ là thời gian hồi sinh, nó còn là hồi chuông cảnh báo san phẳng mọi kẻ ngáng đường!!"
    },
    {
        "id":  19,
        "title":  "Thòng Lọng Ma: Quỷ Cái Đòi Mạng",
        "genre":  "Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  105,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f11%2f04%2f400wx633h%2D095620%2D041126%2D59.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Liêu Sĩ Hàn",
        "actors":  "Wilson Hsu, Vera Chen, Travis Hu, Trần Bác Chính,...",
        "trailer":  "https://www.youtube.com/watch?v=n4_gVXzDiwQ",
        "releaseDate":  "13/11/2026",
        "description":  "Bộ phim mở đầu bằng một nghi lễ trừ tà bị cấm được phát trực tiếp tại Indonesia, vô tình đánh thức Kuntilanak - linh hồn nữ quỷ báo thù trong truyền thuyết dân gian địa phương. Lời nguyền nhanh chóng lan đến Đài Loan, kéo theo hàng loạt cái chết bí ẩn và những vụ quỷ ám kinh hoàng. Sau khi Mila trở thành nạn nhân đầu tiên, con trai cô quyết định đưa tro cốt của mẹ trở về Indonesia để tìm hiểu sự thật đằng sau cái chết, nhưng lại bị cuốn vào cơn ác mộng bắt nguồn từ những tín ngưỡng cổ xưa và mối thù hận chưa được hóa giải. Khi thế lực siêu nhiên ngày càng trở nên đáng sợ, cả nhóm buộc phải đối mặt với Kuntilanak và tìm cách chấm dứt lời nguyền trước khi nó cướp đi tất cả"
    },
    {
        "id":  20,
        "title":  "Ma Mút Con Vượt Kỷ Băng Hà",
        "genre":  "Hoạt hình",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f11%2f04%2fmmc%2Dmain%2D400x633%2D105318%2D041126%2D65.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Đang cập nhật",
        "actors":  "Phi Phụng - Ngọc Tưởng - Hải Yến Idol - DatKaa - Phát Huy T4 - Hồ Tiến Đạt - Huyền Chi - Trần Vũ - Sơn Trần",
        "trailer":  "https://www.youtube.com/watch?v=RVS0j5tCHnM",
        "releaseDate":  "20/11/2026",
        "description":  "Fluffy là một chú ma mút con tỉnh giấc sau giấc ngủ kéo dài hàng nghìn năm giữa vùng Nam Cực băng giá. Khi nhận ra mình đã lạc khỏi đàn, Fluffy bắt đầu hành trình tìm kiếm mẹ. Theo lời kể của những người xung quanh, mẹ cùng đàn ma mút của cậu có thể đã đến châu Phi xa xôi. Trên hành trình tìm mẹ đầy gian nan ấy, Fluffy gặp gỡ Puffin, một chú hải âu cổ rụt nhỏ mang trong mình ước mơ trở thành rapper nổi tiếng và được biểu diễn tại cuộc thi tìm kiếm tài năng Africa\u0027s Got Talent. Cùng nhau, đôi bạn bước vào chuyến phiêu lưu kỳ thú, vượt qua hàng loạt thử thách như lênh đênh trên đại dương với một tảng băng trôi, đối mặt với những con cá sấu đói bụng hay thoát khỏi bầy linh cẩu xảo quyệt. Không chỉ là hành trình tìm mẹ và chinh phục ước mơ, chuyến đi còn giúp Fluffy và Puffin hiểu hơn về tình bạn, sự quan tâm, trách nhiệm và tinh thần tương trợ lẫn nhau."
    },
    {
        "id":  21,
        "title":  "Trại Giam Hạnh Phúc",
        "genre":  "Hài hước, Tình cảm",
        "releaseYear":  2026,
        "durationMinutes":  127,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f29%2ftghp%2Dmain%2Dsocial%2D4%2D162507%2D291026%2D52.jpg",
        "ageRating":  "C16",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Trung Lùn",
        "actors":  "Tuấn Trần, Tiến Luật, Ma Ran Đô, Lương Thế Thành, La Thành, Hoàng Phi, Khuyến Dương,...",
        "trailer":  "https://www.youtube.com/watch?v=7Wmrhp3e3O0",
        "releaseDate":  "20/11/2026",
        "description":  "Phúc (Tuấn Trần), từ một giáo viên hiền lành, tốt bụng vì muốn cứu em gái (Sally Hồng Anh) mà trở thành sát nhân, phải vào tù. Cuộc sống sau song sắt vô cùng khắc nghiệt nhưng Phúc cố gắng nhẫn nhịn, mong sớm được trở về với tự do. Nhờ bản tính lương thiện, anh khiến người cán bộ quản giáo vô cùng nguyên tắc tên Tú (Ma Ran Đô) và các phạm nhân khác dần thay đổi theo hướng tích cực, hòa hợp và đồng cảm với nhau hơn. \n\nTrong lúc \"giáo án đặc biệt nhất\" đang được viết trong nhà tù thì em gái của Phúc cũng phải đối diện với một cuộc sống đầy thử thách khi không còn anh trai bên cạnh. Còn tên tù nhân sừng sỏ Long (Lương Thế Thành) cũng luôn rập rình chực chờ trả thù Phúc."
    },
    {
        "id":  22,
        "title":  "Gặp Gỡ Thông Gia: Dâu Mới Trình Làng",
        "genre":  "Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f29%2f400x633%2D105537%2D290926%2D48.png",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "John Hamburg",
        "actors":  "Robert De Niro, Ben Stiller, Ariana Grande, Owen Wilson, Blythe Danner, Teri Polo, Skyler Gisondo, Beanie Feldstein, Eduardo Franco.",
        "trailer":  "https://www.youtube.com/watch?v=QJ_xJdSLqyk",
        "releaseDate":  "27/11/2026",
        "description":  "Henry, con trai của Greg Focker đưa bạn gái mình, một chuyên gia đàm phán con tin của FBI về ra mắt gia đình. Mọi chuyện bắt đầu trở nên rối rắm khi Henry tiết lộ kế hoạch cầu hôn, khiến Greg không khỏi lo lắng và kéo theo hàng loạt tình huống dở khóc dở cười."
    },
    {
        "id":  23,
        "title":  "Hexed: Thế Giới Phép Thuật",
        "genre":  "Hoạt hình, Phiêu lưu",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f13%2fhexed%2D007c%2Dg%2Dvie%2Dvn%2D70x100%2D103712%2D131026%2D89.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Jason Hand, Fawn Veerasunthorn, Josie Trinidad",
        "actors":  "Hailee Steinfeld, Rashida Jones, Tracey Ullman, Stephen Fry",
        "trailer":  "https://www.youtube.com/watch?v=LtFEynKZq-I",
        "releaseDate":  "27/11/2026",
        "description":  "Trong “Hexe – Thế giới Phép Thuật”, cô thiếu nữ bốc đồng và có phần khác biệt Billie (lồng tiếng bởi Hailee Steinfeld) bất ngờ phát hiện mình sở hữu những năng lực phép thuật bí ẩn. Khi sức mạnh ấy được giải phóng, Billie bị cuốn vào một hành trình kỳ ảo đầy choáng ngợp, rời khỏi vùng ngoại ô quen thuộc để bước chân vào Hexe – một thế giới phù thủy rộng lớn. Buộc phải đồng hành cùng người mẹ thận trọng Alice (lồng tiếng bởi Rashida Jones), hai mẹ con dần khám phá những bí mật của gia đình có thể làm thay đổi thế giới phù thủy mãi mãi"
    },
    {
        "id":  24,
        "title":  "Bắt Cá Ba Tay",
        "genre":  "Tình cảm, Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  115,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f29%2f041226%2Dbat%2Dca%2D3%2Dtay%2D131458%2D291026%2D46.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Như Trang",
        "actors":  "Thuý Ngân, Steven Nguyễn, Ngô Kiến Huy, Otis",
        "trailer":  "https://www.youtube.com/watch?v=AAScHmdvemE",
        "releaseDate":  "04/12/2026",
        "description":  "Một lời cầu duyên, ba chàng trai và một đống rắc rối!\nTrong BẮT CÁ BA TAY, sau một lần cầu duyên, Yên (Thúy Ngân) bất ngờ chứng kiến cả ba người yêu cũ là Tùng (Steven Nguyễn), Phong (Ngô Kiến Huy) và Minh (Otis) đồng loạt muốn nối lại tình xưa. Đứng trước ba chàng trai với ba tính cách và ba màu sắc tình yêu khác biệt, Yên quyết định cho cả ba cơ hội cùng lúc. Nhưng khi những cuộc hẹn chồng chéo và bí mật dần có nguy cơ bị phanh phui, liệu cô nàng có thể tìm được tình yêu đích thực hay sẽ nhận về một cú \"nghiệp quật\" nhớ đời?"
    },
    {
        "id":  25,
        "title":  "Con Mắt Thứ Ba",
        "genre":  "Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f02%2f041226%2Dcon%2Dmat%2Dthu%2Dba%2D160555%2D021026%2D98.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Hàm Trần",
        "actors":  "Đoàn Minh Anh, Quang Tuấn, Ba Tây, Loube Nguyễn, Trần Nghĩa, Cao Thùy Linh, Gia Tuệ, Ngọc Phước, Thư Nguyễn,...",
        "trailer":  "https://www.youtube.com/watch?v=_BHUciHkp6M",
        "releaseDate":  "04/12/2026",
        "description":  "Một kẻ cuồng tín sau cơn đau đầu dữ dội phát hiện ra mình có một con mắt dọc trên trán. Những vụ sát nhân hàng loạt. Những hồn ma bóng quỷ lẩn khuất trong đời sống. Những nỗi sợ rình rập từ ám ảnh quá khứ. Sợi Chỉ Đỏ là gì, và sẽ kết nối tất cả như thế nào?"
    },
    {
        "id":  26,
        "title":  "Đêm Hung Tàn 2",
        "genre":  "Hành động, Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f16%2fvn2%2Dteaser%2D400x633%2D105300%2D161026%2D55.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Tommy Wirkola",
        "actors":  "David Harbour, Kristen Bell, Jared Harris, Joe Pantoliano, Maxwell Friedman, Daniela Melchior, Andrew Bachelor",
        "trailer":  "https://www.youtube.com/watch?v=2kIluqVPtC8",
        "releaseDate":  "04/12/2026",
        "description":  "Nếu ngoan, bạn sẽ được nhận quà từ Ông Già Noel. Nếu hư, bạn sẽ nhận lấy công lý. Giờ đây, Ông Già Noel nổi loạn ấy lại một lần nữa khoác lên bộ đồ đỏ quen thuộc để đối đầu với một tên trùm tội phạm ác độc đang gieo rắc nỗi kinh hoàng cho các tiểu thương tại trung tâm thương mại Silver Bell Mall. Thế nhưng, vì lỡ quên mất ý nghĩa thực sự của Giáng Sinh, Ông Già Noel nay đã trở thành “trẻ hư”, mất hết phép thuật và bị tước đi mọi quyền năng. Tình huống tréo ngoe này đã đưa ông bước vào cuộc phiêu lưu đầy tình người bên trong trung tâm thương mại, nơi cuộc sống của những tiểu thương đang dần rơi vào tuyệt vọng và cần đến sự giúp đỡ. Trong lúc phép thuật dần cạn kiệt và thời gian cũng chẳng còn nhiều, ông buộc phải tìm một cách khác để chống lại đám côn đồ đang đe dọa nơi đây. Và để cứu lấy Giáng Sinh, Ông Già Noel phải tìm lại niềm tin bên trong mình vào lòng tốt và gọi đến sự chi viện vào phút chót từ người mà chẳng tên phản diện nào muốn đụng độ: Bà Già Noel."
    },
    {
        "id":  27,
        "title":  "Đơn Hàng Ma Ám",
        "genre":  "Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  99,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f11%2f02%2fdhm%2Dmainposter%2D400x633%2D153703%2D021126%2D92.jpg",
        "ageRating":  "C18",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Dinna Jasanti",
        "actors":  "Fatih Unru, Yasamin Jasem, Gabriella Ekaputri,…",
        "trailer":  "https://www.youtube.com/watch?v=l4r_Jn12UlY",
        "releaseDate":  "11/12/2026",
        "description":  "Khi nhận hàng online trở thành án tử!\nMột nhóm sinh viên nhận được những kiện hàng bí ẩn không rõ nguồn gốc. Sự tò mò thôi thúc họ mở từng kiện hàng, nhưng cũng chính là lúc cơn ác mộng bắt đầu… Những cái chết kỳ dị liên tiếp xảy ra: thi thể bị đàn ong vây kín, tai nạn quái dị và sự mất kiểm soát tâm trí. Giữa vòng xoáy nghi kỵ, họ bàng hoàng nhận ra sự thật lạnh sống lưng: Mỗi lần nhận hàng đều có thể dẫn đến cái chết. Lời nguyền này đến từ đâu, ai là kẻ chủ mưu giật dây cho cuộc tàn sát đẫm máu? Một cuộc đua sinh tồn nghẹt thở, nơi lòng tin vỡ vụn và cái chết chực chờ sau mỗi lần mở đơn hàng online."
    },
    {
        "id":  28,
        "title":  "Dune: Hành Tinh Cát - Phần Ba",
        "genre":  "Khoa học, viễn tưởng",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f21%2fvn%2Ddune3%2Dvert%2Dmain%2D2764x4096%2Dintl%2D100547%2D211026%2D49.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Denis Villeneuve",
        "actors":  "Timothée Chalamet, Zendaya, Jason Momoa, Florence Pugh, Rebecca Ferguson, Isaach De Bankolé, Charlotte Rampling, Anya Taylor-Joy, Robert Pattinson, Javier Bardem,...",
        "trailer":  "https://www.youtube.com/watch?v=NdvqHc56lE0",
        "releaseDate":  "18/12/2026",
        "description":  "Dune: Hành Tinh Cát - Phần Ba lấy bối cảnh gần hai thập kỷ sau khi Paul Atreides nắm quyền kiểm soát Đế chế. Giờ đây, khi đã trở thành một Hoàng đế tàn nhẫn, Paul phải đối mặt với những hậu quả từ chính sự cai trị của mình. Những đồng minh cũ trở lại, những mỗi đe dọa mới trỗi dậy, và cả sự phản bội luôn lẩn khuất trong bóng tối. Bị ám ảnh bởi viễn cảnh Đế chế sụp đổ cùng sự trở lại của một người anh từng yêu thương, Paul bị cuốn vào một âm mưu hủy diệt - mà trung tâm của bí mật ấy lại chính là Chani. Cuộc nổi dậy dần nhen nhóm, những kẻ thù ngày một áp sát. Chính lúc này đây, Paul sẽ phải đối diện với cái giá thực sự của quyền lực, đánh đổi bằng định mệnh của những người quan trọng nhất cuộc đời anh."
    },
    {
        "id":  29,
        "title":  "Huyết Thống",
        "genre":  "Kinh dị",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f09%2f17%2f400x633%2D115224%2D170926%2D51.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Đinh Đức Thiện",
        "actors":  "Quách Ngọc Ngoan, Quang Tuấn, Lan Phương",
        "trailer":  "https://www.youtube.com/watch?v=T9_qgPR3h10",
        "releaseDate":  "25/12/2026",
        "description":  "Huyết Thống là một bản \"tụng kinh hoà tấu\" xoay quanh nhân vật Tâm (Quách Ngọc Ngoan) và Liêm (Quang Tuấn) trong hành trình trục vong cho một bé gái. Một người là bác sĩ đầy thành tựu tin vào sức mạnh của y học, người còn lại là thầy pháp tin vào luật nhân quả. Hai người đàn ông với hai niềm tin và phương cách khác nhau nhưng cùng chung một mục đích cứu lấy đứa trẻ vô tội. Nhưng \"nợ máu trả máu\", chính cái nghiệp báo không đứt đã đánh thức một oán linh cực kì nguy hiểm trở lại dương thế, mở ra một cuộc đối đầu kinh hãi trên màn ảnh."
    },
    {
        "id":  30,
        "title":  "Jumanji: Thế Giới Đảo Chiều",
        "genre":  "Phiêu lưu, Hài hước",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f29%2f251226%2Djumanji%2D3%2D113500%2D291026%2D14.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Đang cập nhật",
        "actors":  "Đang cập nhật",
        "trailer":  "https://www.youtube.com/watch?v=nIw1O3zvOfE",
        "releaseDate":  "25/12/2026",
        "description":  "Các anh hùng của chúng ta đã từng thoát khỏi khu rừng Jumanji luôn thay đổi trước đây, nhưng lần này trò chơi đến với chúng ta - khi Jumanji thoát khỏi máy chơi game, giải phóng sự hỗn loạn của nó vào thế giới của chúng ta."
    },
    {
        "id":  31,
        "title":  "Người Mẹ Xấu",
        "genre":  "Tình cảm, Hành động",
        "releaseYear":  2026,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f13%2f400x633%2D142750%2D131026%2D42.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Hoàng Tuấn Cường",
        "actors":  "Hồng Đào, Steven Nguyễn, Doãn Quốc Đam,...",
        "trailer":  "https://www.youtube.com/watch?v=ToGzTHgj9ik",
        "releaseDate":  "31/12/2026",
        "description":  "Nghệ sĩ Hồng Đào và Steven Nguyễn lần đầu hoá thân mẹ con trong phim Người Mẹ Xấu. Câu chuyện kể về hành trình đầy éo le và khốc liệt của hai mẹ con bị xếp vào thành phần “bất hảo” trong xã hội. Khi người con muốn hoàn lương, một ân oán của người mẹ khiến anh phải bước vào trận chiến dữ dội nhất."
    },
    {
        "id":  32,
        "title":  "Phim Angry Birds 3",
        "genre":  "Hoạt hình",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f16%2f400x633%2D105832%2D161026%2D91.png",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "John Rice",
        "actors":  "Jason Sudeikis, Josh Gad, Emma Myers, Rachel Bloom, Walker Scobell, Danny McBride, Marcello Hernández, Tim Robinson, Anna Cathcart, Maitreyi Ramakrishnan, Nikki Glaser, MrBeast, Salish Matter, Psalm West, Sam Richardson, James Austin Johnson cùng với Lily James và Keke Palmer.",
        "trailer":  "https://www.youtube.com/watch?v=a9DB_aUMzME",
        "releaseDate":  "01/01/2027",
        "description":  "Dịp lễ này, Red sẽ phải đối đầu với thử thách nhọc nhằn nhất đời mình: vừa học cách làm cha, vừa giải cứu thế giới!"
    },
    {
        "id":  33,
        "title":  "Trên Con Đường Mới",
        "genre":  "Hành động, Tình cảm",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f14%2ftren%2Dcon%2Dduong%2Dmoi%2Ddkkc%2D01%2D01%2D2027%2Dkt%2Dchuan%2D160254%2D141026%2D93.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Trần Bảo Sơn",
        "actors":  "Trần Bảo Sơn và một số diễn viên khác",
        "trailer":  "https://www.youtube.com/shorts/OtMvWIP5uz4",
        "releaseDate":  "01/01/2027",
        "description":  "Trung – một người đàn ông mang theo quá khứ nhiều biến động – bước vào hành trình tìm kiếm một con đường mới giữa thế giới của tiền bạc, quyền lực, tội phạm và những ràng buộc gia đình."
    },
    {
        "id":  34,
        "title":  "Chuyến Đi Nhớ Đời",
        "genre":  "Gia đình",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f19%2f1910%2Dteaser2%2Dof%2D145337%2D191026%2D35.png",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Lê Nhựt Phạm Huy",
        "actors":  "Phương Nam, Bảo Nam, Kyo York, Lộ Lộ, Tạ Lâm, Uy Trần, Năm Chà, Khuyến Dương,...",
        "trailer":  "https://www.youtube.com/watch?v=CGxjGHyMXjM",
        "releaseDate":  "22/01/2027",
        "description":  "Từ một chuyến đi biển định mệnh, Hoàng và cậu con trai tinh nghịch An bị cuốn vào cơn bão, mắc kẹt trên hoang đảo và buộc phải cùng nhau sinh tồn. Giữa thiên nhiên khắc nghiệt, những tình huống dở khóc dở cười, cả hai bắt đầu một hành trình không chỉ để tìm đường về nhà, mà còn để tìm lại nhau. Một người muốn về nhà, một người muốn ở lại. Liệu hành trình của họ sẽ đi về đâu?"
    },
    {
        "id":  35,
        "title":  "Kỷ Băng Hà: Điểm Bùng Nổ",
        "genre":  "Hoạt hình, Phiêu lưu",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f16%2fteaser%2Dposter%2Dice%2Dage%2D145334%2D161026%2D33.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "John C. Donkin",
        "actors":  "Denis Leary, John Leguizamo, Simon Pegg",
        "trailer":  "https://www.youtube.com/watch?v=3fjmjX0QOIg",
        "releaseDate":  "06/02/2027",
        "description":  "Kỷ Băng Hà: Điểm Bùng Nổ do John Donkin (Kỷ băng hà: Cuộc phiêu lưu của Buck Wild) đạo diễn và Lori Forte (Kỷ Băng Hà \u0026 Kỷ Băng Hà: Trời Sập) đảm nhận vai trò nhà sản xuất."
    },
    {
        "id":  36,
        "title":  "Werwulf Ma Sói",
        "genre":  "Kinh dị",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f16%2fwer%2Dteaser%2D400x633%2D144806%2D161026%2D90.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Robert Eggers",
        "actors":  "Aaron Taylor-Johnson, Willem Dafoe, Lily-Rose Depp",
        "trailer":  "https://www.youtube.com/watch?v=CL1EFACsWag",
        "releaseDate":  "26/02/2027",
        "description":  "Hãy sẵn sàng chứng kiến tác phẩm dữ dội và ám ảnh nhất từ trước đến nay của Robert Eggers. Focus Features mang đến bộ phim kinh dị mới với tên gọi WERWULF MA SÓI -  câu chuyện rùng rợn về đức tin, sự đọa đày và con quỷ ẩn sâu trong mỗi con người."
    },
    {
        "id":  37,
        "title":  "Gatto: Cuộc Phiêu Lưu Của Mèo Nero",
        "genre":  "Hoạt hình, Phiêu lưu",
        "releaseYear":  2027,
        "durationMinutes":  120,
        "status":  "COMING_SOON",
        "poster":  "https://files.betacorp.vn/media%2fimages%2f2026%2f10%2f16%2fseafood%2Dinstagram%2Dteaser%2Dposterg%2Dvietnam%2D145553%2D161026%2D29.jpg",
        "ageRating":  "P",
        "format":  "2D Phụ đề / Lồng tiếng",
        "director":  "Enrico Casarosa",
        "actors":  "Enrico Casarosa, Ismail Elsene, Laurence Fishburne",
        "trailer":  "https://www.youtube.com/watch?v=NIKfR_uF_d0",
        "releaseDate":  "05/03/2027",
        "description":  "Trong Gatto: Cuộc phiêu lưu của mèo Nero, sau nhiều năm tìm cách sinh tồn giữa thành phố Venice - Ý chằng chịt kênh đào và đầy rẫy những quan niệm mê tín, chú mèo Nero bắt đầu tự hỏi liệu mình đã thực sự sống đúng với những kiếp đời của mình hay chưa. Mang món nợ với Rocco, tên trùm thế giới ngầm của loài mèo tại địa phương, Nero rơi vào tình thế tiến thoái lưỡng nan. Chú buộc phải xây dựng một tình bạn không ai ngờ tới, một mối duyên có thể giúp chú cuối cùng tìm thấy mục đích thực sự của cuộc đời mình — trừ khi thành phố Venice đầy rẫy hiểm nguy kịp đánh bại chú trước khi điều đó xảy ra."
    }
],
    generateMockShowtimes: function() {
        const list = [];
        const today = new Date();
        const roomMoviePools = {
            1: [2, 28, 16, 4],
            2: [1, 13, 20, 10],
            3: [6, 8, 3, 2],
            4: [4, 2, 18, 26],
            5: [7, 32, 23, 30],
            6: [25, 19, 36, 15],
            7: [24, 3, 11, 21],
            8: [6, 29, 27, 9],
            9: [35, 37, 5, 31]
        };

        let idCounter = 101;
        for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
            const d = new Date(today);
            d.setDate(today.getDate() + dayOffset);
            const dateStr = d.toISOString().split('T')[0];
            const dow = d.getDay();

            let slots = [];
            if (dow === 0 || dow === 6) {
                slots = [
                    { start: "08:30", end: "10:30", price: 85000 },
                    { start: "11:15", end: "13:15", price: 95000 },
                    { start: "14:00", end: "16:00", price: 100000 },
                    { start: "16:45", end: "18:45", price: 110000 },
                    { start: "19:30", end: "21:30", price: 120000 },
                    { start: "22:15", end: "00:15", price: 105000 }
                ];
            } else if (dow === 5) {
                slots = [
                    { start: "09:30", end: "11:30", price: 80000 },
                    { start: "13:00", end: "15:00", price: 90000 },
                    { start: "16:30", end: "18:30", price: 100000 },
                    { start: "19:45", end: "21:45", price: 115000 },
                    { start: "22:30", end: "00:30", price: 105000 }
                ];
            } else if (dayOffset % 2 === 0) {
                slots = [
                    { start: "09:15", end: "11:15", price: 75000 },
                    { start: "13:30", end: "15:30", price: 85000 },
                    { start: "17:45", end: "19:45", price: 95000 },
                    { start: "21:00", end: "23:00", price: 90000 }
                ];
            } else {
                slots = [
                    { start: "10:00", end: "12:00", price: 75000 },
                    { start: "14:15", end: "16:15", price: 85000 },
                    { start: "18:30", end: "20:30", price: 95000 },
                    { start: "21:45", end: "23:45", price: 90000 }
                ];
            }

            for (let roomId = 1; roomId <= 9; roomId++) {
                const pool = roomMoviePools[roomId];
                slots.forEach((s, sIdx) => {
                    const movieId = pool[(sIdx + dayOffset) % pool.length];
                    list.push({
                        id: idCounter++,
                        movieId: movieId,
                        roomId: roomId,
                        showDate: dateStr,
                        startTime: s.start,
                        endTime: s.end,
                        endDate: dateStr,
                        status: "OPEN",
                        basePrice: s.price
                    });
                });
            }
        }
        return list;
    },
    occupiedSeatsByShowtime: {},
    getOccupiedSeats: function(showtimeId) {
        const sId = parseInt(showtimeId) || 1;
        if (!this.occupiedSeatsByShowtime[sId]) {
            // Suất chiếu mặc định chỉ giữ 1-2 ghế giả lập riêng biệt dựa theo showtimeId
            const baseSeat = ((sId * 7) % 45) + 10;
            this.occupiedSeatsByShowtime[sId] = [baseSeat, baseSeat + 1];
        }
        return [...this.occupiedSeatsByShowtime[sId]];
    },
    markSeatOccupied: function(showtimeId, seatId) {
        const sId = parseInt(showtimeId) || 1;
        const numSeatId = parseInt(seatId);
        if (!this.occupiedSeatsByShowtime[sId]) {
            this.occupiedSeatsByShowtime[sId] = [];
        }
        if (!this.occupiedSeatsByShowtime[sId].includes(numSeatId)) {
            this.occupiedSeatsByShowtime[sId].push(numSeatId);
        }
    },
    generateMockSeats: function(roomId) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const seats = [];
        const rId = parseInt(roomId) || 1;
        let id = (rId - 1) * 60 + 1;
        rows.forEach((row, rIdx) => {
            const seatsPerRow = 10;
            for (let num = 1; num <= seatsPerRow; num++) {
                let seatType = 'STANDARD';
                if (rIdx >= 2 && rIdx <= 4) seatType = 'VIP';
                if (rIdx === 5) seatType = 'SWEETBOX';

                // Chỉ có ghế C8 phòng 1 là bảo trì vật lý nếu cần
                const isMaintenance = (rId === 1 && rIdx === 2 && num === 8);

                seats.push({
                    id: id++,
                    seatName: row + num,
                    seatType: seatType,
                    status: isMaintenance ? 'MAINTENANCE' : 'AVAILABLE',
                    roomId: rId
                });
            }
        });
        return seats;
    },
    generateMockTickets: function() {
        return [
            {
                id: 1,
                userId: 2,
                showtimeId: 1,
                seatId: 15,
                finalPrice: 85000,
                status: "PAID",
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                paidAt: new Date(Date.now() - 3600000 * 2 + 120000).toISOString(),
                idempotencyKey: "idem-mock-001"
            },
            {
                id: 2,
                userId: 3,
                showtimeId: 2,
                seatId: 28,
                finalPrice: 110000,
                status: "PAID",
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
                paidAt: new Date(Date.now() - 3600000 * 5 + 60000).toISOString(),
                idempotencyKey: "idem-mock-002"
            },
            {
                id: 3,
                userId: 1,
                showtimeId: 3,
                seatId: 35,
                finalPrice: 95000,
                status: "PENDING",
                createdAt: new Date(Date.now() - 300000).toISOString(),
                expiresAt: new Date(Date.now() + 300000).toISOString(),
                idempotencyKey: "idem-mock-003"
            },
            {
                id: 4,
                userId: 4,
                showtimeId: 5,
                seatId: 52,
                finalPrice: 130000,
                status: "PAID",
                createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
                paidAt: new Date(Date.now() - 3600000 * 12 + 180000).toISOString(),
                idempotencyKey: "idem-mock-004"
            },
            {
                id: 5,
                userId: 5,
                showtimeId: 7,
                seatId: 9,
                finalPrice: 85000,
                status: "CANCELLED",
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                idempotencyKey: "idem-mock-005"
            }
        ];
    }
};
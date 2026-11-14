package com.cinema.movie.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên phim không được để trống")
    private String title;

    @NotBlank(message = "Thể loại không được để trống")
    private String genre;

    @Min(value = 1888, message = "Năm phát hành không hợp lệ")
    private int releaseYear;

    @Min(value = 1, message = "Thời lượng phim phải > 0")
    private Integer durationMinutes = 120;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;

    @Column(length = 1000)
    private String poster;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String ageRating = "P";

    @Column(length = 255)
    private String director;

    @Column(length = 1000)
    private String actors;

    @Column(length = 500)
    private String trailer;

    @Column(length = 50)
    private String releaseDate;

    public Movie() {}

    public Movie(String title, String genre, int releaseYear, String status) {
        this.title = title;
        this.genre = genre;
        this.releaseYear = releaseYear;
        this.status = status;
    }

    public Movie(String title, String genre, int releaseYear, Integer durationMinutes, String status, String poster, String description, String ageRating) {
        this(title, genre, releaseYear, durationMinutes, status, poster, description, ageRating, null, null, null, null);
    }

    public Movie(String title, String genre, int releaseYear, Integer durationMinutes, String status, String poster, String description, String ageRating, String director, String actors, String trailer, String releaseDate) {
        this.title = title;
        this.genre = genre;
        this.releaseYear = releaseYear;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 120;
        this.status = status;
        this.poster = poster;
        this.description = description;
        this.ageRating = ageRating != null ? ageRating : "P";
        this.director = director;
        this.actors = actors;
        this.trailer = trailer;
        this.releaseDate = releaseDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }
    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }
    public String getActors() { return actors; }
    public void setActors(String actors) { this.actors = actors; }
    public String getTrailer() { return trailer; }
    public void setTrailer(String trailer) { this.trailer = trailer; }
    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
}

package com.cookingcooding.workout.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_videos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutVideo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private String storagePath;

    @Column(nullable = false)
    private String fileName;

    private LocalDateTime uploadedAt;
}

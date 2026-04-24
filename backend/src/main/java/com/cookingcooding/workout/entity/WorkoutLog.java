package com.cookingcooding.workout.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "workout_logs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"exercise_id", "log_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private int completedSets;
}

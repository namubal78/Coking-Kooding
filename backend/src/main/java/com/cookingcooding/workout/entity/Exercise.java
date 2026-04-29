package com.cookingcooding.workout.entity;

import com.cookingcooding.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercises")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Exercise {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int totalSets;

    @Column(nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private int restSeconds;

    @Column(nullable = false)
    private int durationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}

package com.cookingkooding.planner.entity;

import com.cookingkooding.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "planner_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlannerItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

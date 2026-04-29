package com.cookingcooding.messenger.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_subscriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPushSubscription {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false, columnDefinition = "TEXT", unique = true)
    private String endpoint;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String p256dh;

    @Column(nullable = false)
    private String auth;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}

package com.cookingcooding.files.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blocked_extensions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlockedExtension {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String extension;

    private boolean isFixed;
}

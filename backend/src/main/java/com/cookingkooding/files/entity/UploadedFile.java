package com.cookingkooding.files.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadedFile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String storedName;

    @Column(nullable = false)
    private String filePath;

    private long fileSize;

    private String extension;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}

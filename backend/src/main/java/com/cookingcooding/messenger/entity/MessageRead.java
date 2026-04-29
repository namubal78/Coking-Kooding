package com.cookingcooding.messenger.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "message_reads")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageRead {

    @Id
    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "last_read_id", nullable = false)
    private Long lastReadId;
}

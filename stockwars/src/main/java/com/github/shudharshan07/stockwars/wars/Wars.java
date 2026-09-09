package com.github.shudharshan07.stockwars.wars;

import com.github.shudharshan07.stockwars.auth.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "wars")
public class Wars {

    @Id
    @Column(name = "war_id", columnDefinition = "BINARY(16)")
    @JdbcTypeCode(SqlTypes.BINARY)
    private UUID warId;

    @Column(name = "war_code", unique = true, nullable = false)
    private String warCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(
            name = "created_by",                   // FK column name
            nullable = false,
            unique = true                     // one refresh token per user
    )
    private Users createdBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", nullable = false)
    private WarConfig config;

    public Wars(WarConfig config)
    {
        this.warId = UUID.randomUUID();
        this.config = config;
    }

}




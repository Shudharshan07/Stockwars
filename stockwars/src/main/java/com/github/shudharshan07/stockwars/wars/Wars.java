package com.github.shudharshan07.stockwars.wars;

import com.github.shudharshan07.stockwars.auth.Users;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


import java.time.LocalDateTime;
import java.util.UUID;

@Entity
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

    public Wars()
    {

    }

    public Wars(WarConfig config)
    {
        this.warId = UUID.randomUUID();
        this.config = config;
    }

    public UUID getWarId() {
        return warId;
    }

    public void setWarId(UUID warId) {
        this.warId = warId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public WarConfig getConfig() {
        return config;
    }

    public void setConfig(WarConfig config) {
        this.config = config;
    }

    public String getWarCode() {
        return warCode;
    }

    public void setWarCode(String warCode) {
        this.warCode = warCode;
    }

    public Users getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }
}




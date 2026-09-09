package com.github.shudharshan07.stockwars.auth.refresh;

import com.github.shudharshan07.stockwars.auth.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @OneToOne
    @JoinColumn(
            name = "user_id",                   // FK column name
            referencedColumnName = "id",      // references Users.id
            nullable = false,
            unique = true                     // one refresh token per user
    )
    private Users user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;
}

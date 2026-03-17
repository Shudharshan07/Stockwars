package com.github.shudharshan07.stockwars.auth.refresh;

import com.github.shudharshan07.stockwars.auth.Users;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {


    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDuration;

    @Autowired
    private RefreshTokenRepository refresh_repo;

    @Transactional
    public RefreshToken createRefreshToken(Users users)
    {
        refresh_repo.deleteByUser(users);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(users);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDuration));

        return refresh_repo.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token)
    {
        if(token.getExpiryDate().isBefore(Instant.now()))
        {
            refresh_repo.delete(token);
            throw new RuntimeException("Refresh token expired. Please login again.");
        }

        return token;
    }

    @Transactional
    public long deleteByUser(Users users)
    {
        return refresh_repo.deleteByUser(users);
    }

    public Long getRefreshTokenDuration() {
        return refreshTokenDuration;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refresh_repo.findByToken(token);
    }
}

package com.github.shudharshan07.stockwars.wars;

import com.github.shudharshan07.stockwars.auth.Users;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.*;

@Service
public class WarService {

    @Autowired
    private WarRepo repo;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public Wars createWar(WarConfig config, Users users)
    {
        if (repo.existsByCreatedBy(users)) {
            throw new IllegalStateException("User already has an active war");
        }

        int maxRetries = 10;
        for(int i = 0; i < maxRetries; i++)
        {
            try {
                Wars war = new Wars(config);
                war.setCreatedBy(users);
                war.setWarCode(createWarCode());
                Wars savedWar = repo.save(war);

                String warCode = savedWar.getWarCode();
                String metaKey = "war:" + warCode + ":meta";
                String orderStream = "war:" + warCode + ":orders";
                String tradeStream = "war:" + warCode + ":trades";


                Map<String, String> meta = new HashMap<>();
                meta.put("initial_balance", String.valueOf(config.getInitialBalance()));
                meta.put("created_by", users.getUsername());
                meta.put("status", "OPEN");
                redisTemplate.opsForHash().putAll(metaKey, meta);
                // after 24 hours it will be removed from he DB
                redisTemplate.expire(metaKey, Duration.ofHours(24));

                Map<String, String> startEvent = new HashMap<>();
                startEvent.put("event", "WAR_START");
                startEvent.put("time", String.valueOf(System.currentTimeMillis()));
                startEvent.put("warCode", warCode);

                redisTemplate.opsForStream().add("global:war_events", startEvent);
                redisTemplate.opsForStream().add(orderStream, startEvent);
                redisTemplate.opsForStream().add(tradeStream, startEvent);

                joinWar(war.getWarCode(), users);
                return savedWar;
            } catch (DataIntegrityViolationException e) {
                if (i == maxRetries - 1) throw new RuntimeException("Failed to generate unique war code");
            }
        }
        throw new RuntimeException("Unexpected error during war creation");
    }

    public Wars joinWar(String war_code, Users users)
    {
        try {
            Wars wars = repo.findByWarCode(war_code).orElse(null);
            if(wars == null) throw new RuntimeException("War not found");

            // we are putting the username not the user details
            // username is the primary key
            String usersKey = "war:" + wars.getWarCode() + ":users";
            String leaderboardKey = "war:" + wars.getWarCode() + ":leaderboard";
            redisTemplate.opsForSet().add(usersKey, users.getUsername());
            
            // Add to leaderboard with initial balance if not already there
            double initialBalance = wars.getConfig().getInitialBalance();
            redisTemplate.opsForZSet().addIfAbsent(leaderboardKey, users.getUsername(), initialBalance);
            
            redisTemplate.expire(usersKey, Duration.ofHours(24));
            redisTemplate.expire(leaderboardKey, Duration.ofHours(24));
            return wars;
        } catch (Exception e) {
            throw new RuntimeException("Failed to Join the war");
        }
    }

    public String deleteWar(UUID war_id, Users users)
    {
        Wars war = repo.findById(war_id)
                .orElseThrow(() -> new RuntimeException("War not found"));

        if (!war.getCreatedBy().getId().equals(users.getId())) {
            throw new AccessDeniedException("You are not allowed to delete this war");
        }
        repo.delete(war);
        String warCode = war.getWarCode();
        String metaKey = "war:" + warCode + ":meta";
        String usersKey = "war:" + warCode + ":users";

        redisTemplate.delete(List.of(metaKey, usersKey));
        return warCode;
    }

    private String createWarCode() {
        StringBuilder sb = new StringBuilder();
        for(int i = 0; i < 8; i++)
        {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}

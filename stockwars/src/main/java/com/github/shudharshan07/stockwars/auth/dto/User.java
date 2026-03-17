package com.github.shudharshan07.stockwars.auth.dto;

import java.util.UUID;

public class User {
    private UUID id;
    private String username;

    public String getUsername() {
        return username;
    }

    public User(UUID id, String username) {
        this.id = id;
        this.username = username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}

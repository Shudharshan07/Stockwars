package com.github.shudharshan07.stockwars.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
}



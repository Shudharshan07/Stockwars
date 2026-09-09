package com.github.shudharshan07.stockwars.auth.dto;

import com.github.shudharshan07.stockwars.auth.Users;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String username;
    private String token;
}

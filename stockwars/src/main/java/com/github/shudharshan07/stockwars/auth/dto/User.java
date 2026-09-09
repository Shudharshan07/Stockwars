package com.github.shudharshan07.stockwars.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;


@Setter
@Getter
@AllArgsConstructor
public class User {
    private UUID id;
    private String username;
}

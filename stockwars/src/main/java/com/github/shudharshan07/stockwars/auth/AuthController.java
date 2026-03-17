package com.github.shudharshan07.stockwars.auth;

import com.github.shudharshan07.stockwars.auth.dto.LoginRequest;
import com.github.shudharshan07.stockwars.auth.dto.LoginResponse;
import com.github.shudharshan07.stockwars.auth.dto.RegisterRequest;
import com.github.shudharshan07.stockwars.auth.dto.User;
import com.github.shudharshan07.stockwars.auth.refresh.RefreshToken;
import com.github.shudharshan07.stockwars.auth.refresh.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;

@RestController
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private UserService service;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${cookie.secure}")
    private boolean cookieSecure;

    @Autowired
    private RefreshTokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request)
    {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String accessToken = jwtService.generateToken(request.getUsername());
            Users users = (Users) authentication.getPrincipal();
            RefreshToken refreshToken = tokenService.createRefreshToken(users);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(tokenService.getRefreshTokenDuration())
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new LoginResponse(request.getUsername(), accessToken));
        }

        return ResponseEntity.status(401).build();
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request)
    {
        if(request.getUsername() == null || request.getPassword() == null) return ResponseEntity.status(401).build();
        if(service.findUser(request.getUsername()) != null) return ResponseEntity.status(401).build();

        Users users = new Users();
        users.setPassword(request.getPassword());
        users.setUsername(request.getUsername());

        service.addUser(users);

        return ResponseEntity.ok().body(new User(users.getId(), users.getUsername()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request)
    {
        String token = getCookieValue(request, "refreshToken");

        if(token == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh Token is missing");

        return tokenService.findByToken(token)
                .map(tokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(users -> {
                    String accessToken = jwtService.generateToken(users.getUsername());
                    return ResponseEntity.ok(new LoginResponse(users.getUsername(), accessToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response)
    {
        String token = getCookieValue(request, "refreshToken");
        if (token != null) {
            tokenService.findByToken(token)
                    .map(RefreshToken::getUser)
                    .ifPresent(tokenService::deleteByUser);
        }

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "" )
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        // need to implement
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private String getCookieValue(HttpServletRequest request, String name)
    {
        Cookie cookie = WebUtils.getCookie(request, name);
        return (cookie != null) ? cookie.getValue() : null;
    }
}

package com.github.shudharshan07.stockwars.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepo repo;

    @Autowired
    @Lazy
    private PasswordEncoder encoder;

    public void addUser(Users user)
    {
        user.setId(UUID.randomUUID());
        user.setPassword(encoder.encode(user.getPassword()));
        user.setEnabled(true);
        repo.save(user);
    }

    public void removeUser(String username)
    {
        repo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found with username : " + username));
        repo.deleteByUsername(username);
    }


    public Users findUser(String username)
    {
        return repo.findByUsername(username).orElse(null);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not Found"));
    }
}

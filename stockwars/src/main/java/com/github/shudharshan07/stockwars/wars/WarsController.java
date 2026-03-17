package com.github.shudharshan07.stockwars.wars;

import com.github.shudharshan07.stockwars.auth.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wars")
public class WarsController {

    @Autowired
    private WarService service;

    @PostMapping("/create_war")
    public ResponseEntity<Wars> createWar(@RequestBody WarConfig config, @AuthenticationPrincipal Users users)
    {
        Wars wars = service.createWar(config, users);
        Wars join_wars = service.joinWar(wars.getWarCode(), users);
        return ResponseEntity.ok(join_wars);
    }

    @DeleteMapping("/delete_war/{war_id}")
    public ResponseEntity<String> deleteWar(@PathVariable UUID war_id, @AuthenticationPrincipal Users users)
    {
        return ResponseEntity.ok(service.deleteWar(war_id, users));
    }

    @PostMapping("/join_war/{war_code}")
    public ResponseEntity<Wars> joinWar(@PathVariable String war_code, @AuthenticationPrincipal Users users)
    {
        return ResponseEntity.ok(service.joinWar(war_code, users));
    }
}


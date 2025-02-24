package com.jiraClone.jiraclone.web;

import com.jiraClone.jiraclone.services.impl.KeycloakServiceImpl;
import lombok.RequiredArgsConstructor;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final KeycloakServiceImpl keycloakService;

    @GetMapping("/all")
    public ResponseEntity<List<UserRepresentation>> fetchUsers(){
        try {
            return ResponseEntity.ok(keycloakService.getUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }
}

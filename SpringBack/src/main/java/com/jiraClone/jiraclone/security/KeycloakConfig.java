package com.jiraClone.jiraclone.security;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Bean
    public Keycloak keycloakAdminClient(){
           return KeycloakBuilder.builder()
                   .serverUrl("http://localhost:8888")
                   .realm("delivery-manager")
                   .clientId("admin-cli")
                   .username("admin@gmail.com")
                   .password("admin")
                   .build();
    }
    @Bean
    public RealmResource realmResource(Keycloak keycloakAdminClient) {
        return keycloakAdminClient.realm("delivery-manager");
    }

    @Bean
    public UsersResource usersResource(RealmResource realmResource) {
        return realmResource.users();
    }
}
package com.imo.adminconfig.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CurrentUserService {

    @Value("${spring.user.roles:{}}")
    private String rolesJson;

    private Map<String, String> roleMapping = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        try {
            if (rolesJson != null && !rolesJson.trim().isEmpty() && !rolesJson.equals("{}")) {
                roleMapping = objectMapper.readValue(rolesJson, new TypeReference<Map<String, String>>() {});
            }
        } catch (Exception e) {
            // Fallback to empty or default mapping
            roleMapping = Collections.emptyMap();
        }
    }

    public Jwt getJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new SecurityException("Unauthorized: No JWT token found in security context");
        }
        return (Jwt) authentication.getPrincipal();
    }

    public String getEmail() {
        Jwt jwt = getJwt();
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            email = jwt.getClaimAsString("user_name"); // alternative claim name
        }
        return email != null ? email : "";
    }

    public String getName() {
        Jwt jwt = getJwt();
        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        if (givenName != null && familyName != null) {
            return givenName + " " + familyName;
        }
        String name = jwt.getClaimAsString("name");
        return name != null ? name : getEmail();
    }

    public Map<String, Boolean> getAllGroups() {
        Jwt jwt = getJwt();
        List<String> scopes = jwt.getClaimAsStringList("scope");
        if (scopes == null) {
            scopes = Collections.emptyList();
        }

        Map<String, Boolean> userRoles = new HashMap<>();
        for (Map.Entry<String, String> entry : roleMapping.entrySet()) {
            String appRole = entry.getKey();
            String btpScope = entry.getValue();
            boolean hasRole = scopes.stream().anyMatch(scope -> scope.equalsIgnoreCase(btpScope));
            userRoles.put(appRole, hasRole);
        }
        return userRoles;
    }
}

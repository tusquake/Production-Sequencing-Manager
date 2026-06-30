package com.imo.adminconfig.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class UserContextHelper {

    private final CurrentUserService currentUserService;

    @Autowired
    public UserContextHelper(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    public String getUserEmail() {
        try {
            String email = currentUserService.getEmail();
            if (email != null && !email.trim().isEmpty()) {
                return email;
            }
        } catch (Exception e) {
            // Context exceptions or running locally
        }

        // Fallback to HTTP request headers
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String headerEmail = request.getHeader("user-email");
            if (headerEmail != null && !headerEmail.trim().isEmpty()) {
                return headerEmail;
            }
        }

        // Default fallback placeholder
        return "tushar.seth@incture.com";
    }

    public String getUserName() {
        try {
            String name = currentUserService.getName();
            if (name != null && !name.trim().isEmpty()) {
                return name;
            }
        } catch (Exception e) {
            // Context exceptions or running locally
        }

        // Fallback to HTTP request headers
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String headerName = request.getHeader("user-name");
            if (headerName != null && !headerName.trim().isEmpty()) {
                return headerName;
            }
        }

        // Default fallback placeholder
        return "Tushar Seth";
    }
}

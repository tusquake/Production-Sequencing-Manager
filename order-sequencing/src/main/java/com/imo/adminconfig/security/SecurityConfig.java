package com.imo.adminconfig.security;

import com.sap.cloud.security.xsuaa.XsuaaServiceConfiguration;
import com.sap.cloud.security.xsuaa.token.TokenAuthenticationConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("!local && !gcp")
public class SecurityConfig {

    private final XsuaaServiceConfiguration xsuaaServiceConfiguration;

    @Autowired
    public SecurityConfig(XsuaaServiceConfiguration xsuaaServiceConfiguration) {
        this.xsuaaServiceConfiguration = xsuaaServiceConfiguration;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/assets/**",
                    "/favicon.svg",
                    "/icons.svg",
                    "/*.js",
                    "/*.css",
                    "/*.png",
                    "/*.ico",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(getJwtAuthenticationConverter()))
            );
        return http.build();
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> getJwtAuthenticationConverter() {
        TokenAuthenticationConverter converter = new TokenAuthenticationConverter(xsuaaServiceConfiguration);
        converter.setLocalScopeAsAuthorities(true);
        return converter;
    }
}

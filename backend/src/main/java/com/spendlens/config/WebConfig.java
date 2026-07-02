package com.spendlens.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowedOrigin = System.getenv("FRONTEND_URL");
        if (allowedOrigin == null || allowedOrigin.isEmpty()) {
            allowedOrigin = "http://localhost:3000";
        }
        allowedOrigin = allowedOrigin.replaceAll("/$", "");

        registry.addMapping("/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

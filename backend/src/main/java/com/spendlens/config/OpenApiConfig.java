package com.spendlens.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI spendLensOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SpendLens Core REST API")
                        .description("Privacy-first Financial Intelligence Platform API Specifications")
                        .version("1.0.0"));
    }
}

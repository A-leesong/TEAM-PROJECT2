package com.egag.common.config;

import com.egag.auth.JwtAuthFilter;
import com.egag.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthService authService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 추가
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 1. 공용 API 및 인증 관련
                        .requestMatchers("/api/auth/**", "/api/auth/kakao/**").permitAll()
                        .requestMatchers("/api/canvas/**", "/api/policy/**", "/api/search/**", "/api/inquiries/**").permitAll()

                        // 2. GET 요청 허용 (상세 페이지 등)
                        .requestMatchers(HttpMethod.GET, "/api/artworks/**", "/api/users/{id}/**", "/api/payments/packages").permitAll()

                        // 3. 결제 및 기타 설정
                        .requestMatchers("/api/payments/webhook", "/api/payments/kakaopay/approve").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // 4. ⭐ 관리자 전용 설정 (권한 체크)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                // 5. 권한 부족(403) 시 처리 로직 추가
                .exceptionHandling(exc -> exc
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            // 명세서의 "403 후 홈으로 redirect"는 프론트에서 처리하는 것이 일반적이지만,
                            // API 레벨에서 정확한 에러 메시지를 내려주도록 설정합니다.
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"message\": \"관리자 권한이 필요한 서비스입니다.\"}");
                        })
                )

                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정 (프론트엔드 주소 허용)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173")); // Vite 기본 포트
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
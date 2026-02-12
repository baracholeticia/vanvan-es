package com.vanvan.config.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;

    private Algorithm getAlgorithm() {
        return Algorithm.HMAC256(SECRET);
    }


    /*
     * Gera token usando email
     * **/
    public String generateToken(String email) {
        return JWT.create()
                .withSubject(email)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS))
                .sign(getAlgorithm());
    }

    /*
     * Valida token
     * **/
    public String validateAndGetSubject(String token) {
        DecodedJWT decoded = JWT.require(getAlgorithm())
                .build()
                .verify(token);

        return decoded.getSubject();
    }
}

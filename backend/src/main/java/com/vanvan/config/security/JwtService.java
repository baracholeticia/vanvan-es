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
    private static String SECRET;
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);


    /*
     * Gera token usando email
     * **/
    public static String generateToken(String email) {
        return JWT.create()
                .withSubject(email)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS))
                .sign(ALGORITHM);
    }

    /*
     * Valida token
     * **/
    public static String validateAndGetSubject(String token) {
        DecodedJWT decoded = JWT.require(ALGORITHM)
                .build()
                .verify(token);

        return decoded.getSubject();
    }
}

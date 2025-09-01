
package es.mde.security.services;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	public final static String SECRET_KEY = createSecretKey();//"586E3272357538782F413F4428472B4B6250655368566B597033733676397924";
	public String getToken(UserDetails usuario) {
		return getToken(new HashMap<>(), usuario);
	}
	
	private String getToken(Map<String, Object> extraClaims, UserDetails usuario) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(usuario.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()+1000*60*24))
                .signWith(getKey())
                .compact();
	}
	
	 private SecretKey getKey() {
	       byte[] keyBytes=Decoders.BASE64.decode(SECRET_KEY);
	       return Keys.hmacShaKeyFor(keyBytes);
	    }

	    public String getUsernameFromToken(String token) {
	        return getClaim(token, Claims::getSubject);
	    }

	    public boolean isTokenValid(String token, UserDetails userDetails) {
	        final String username=getUsernameFromToken(token);
	        return (username.equals(userDetails.getUsername())&& !isTokenExpired(token));
	    }

	    private Claims getAllClaims(String token)
	    {
	        return Jwts
	            .parser()
	            .verifyWith(getKey())
	            .build()
	            .parseSignedClaims(token)
	            .getPayload();
	    }

	    public <T> T getClaim(String token, Function<Claims,T> claimsResolver)
	    {
	        final Claims claims=getAllClaims(token);
	        return claimsResolver.apply(claims);
	    }

	    private Date getExpiration(String token)
	    {
	        return getClaim(token, Claims::getExpiration);
	    }

	    private boolean isTokenExpired(String token)
	    {
	        return getExpiration(token).before(new Date());
	    }
	    
	    private static String createSecretKey() {
	    	SecureRandom secureRandom = new SecureRandom();
	    	byte[] secretKeyBytes = new byte[32];
	    	secureRandom.nextBytes(secretKeyBytes);
	    	String SECRET_KEY= Base64.getEncoder().encodeToString(secretKeyBytes);
	    	return SECRET_KEY;
	    }
}

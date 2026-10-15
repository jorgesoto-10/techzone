package com.techzone.techzone;

@org.springframework.boot.autoconfigure.SpringBootApplication(
  exclude = org.springframework.boot.autoconfigure.security.servlet
    .UserDetailsServiceAutoConfiguration.class
)
public class TechzoneApplication {

  public static void main(String[] args) {
    org.springframework.boot.SpringApplication.run(
      TechzoneApplication.class,
      args
    );
  }
}

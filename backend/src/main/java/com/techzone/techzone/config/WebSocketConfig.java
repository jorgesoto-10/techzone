package com.techzone.techzone.config;

import com.techzone.techzone.config.websocket.WebSocketAuthInterceptor;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
  implements WebSocketMessageBrokerConfigurer {

  private final WebSocketAuthInterceptor seguridad;
  private final String[] origenes;

  public WebSocketConfig(
    WebSocketAuthInterceptor seguridad,
    @Value("${app.cors.origin:http://localhost:5173}")
    String origenes
  ) {
    this.seguridad = seguridad;

    this.origenes = Arrays.stream(
      origenes.split(",")
    )
      .map(String::trim)
      .filter(s -> !s.isEmpty())
      .toArray(String[]::new);
  }

  @Override
  public void registerStompEndpoints(
    StompEndpointRegistry registry
  ) {
    registry
      .addEndpoint("/api/ws")
      .setAllowedOrigins(origenes)
      .withSockJS()
      .setSessionCookieNeeded(false);
  }

  @Override
  public void configureMessageBroker(
    MessageBrokerRegistry registry
  ) {
    registry
      .enableSimpleBroker("/queue")
      .setTaskScheduler(notificacionesScheduler())
      .setHeartbeatValue(
        new long[] { 10000, 10000 }
      );

    registry.setUserDestinationPrefix("/user");
    registry.setApplicationDestinationPrefixes("/app");
  }

  @Bean
  public ThreadPoolTaskScheduler notificacionesScheduler() {
    ThreadPoolTaskScheduler scheduler =
      new ThreadPoolTaskScheduler();

    scheduler.setPoolSize(1);
    scheduler.setThreadNamePrefix(
      "notificaciones-heartbeat-"
    );

    return scheduler;
  }

  @Override
  public void configureClientInboundChannel(
    ChannelRegistration registration
  ) {
    registration.interceptors(seguridad);
  }

  @Override
  public void configureClientOutboundChannel(
    ChannelRegistration registration
  ) {
    registration.interceptors(
      new ChannelInterceptor() {
        @Override
        public Message<?> preSend(
          Message<?> message,
          MessageChannel channel
        ) {
          return seguridad.filtrarSalida(message);
        }
      }
    );
  }
}
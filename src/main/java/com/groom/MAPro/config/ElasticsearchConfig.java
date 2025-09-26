package com.groom.MAPro.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.Header;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.message.BasicHeader;
import org.apache.http.ssl.SSLContextBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

import javax.net.ssl.SSLContext;

@Configuration
public class ElasticsearchConfig {
    @Value("${spring.elasticsearch.uris}")  // application.yml에 설정
    private String host;

    @Value("${spring.elasticsearch.port:9200}")
    private int port;

    @Value("${spring.elasticsearch.username}")
    private String username;

    @Value("${spring.elasticsearch.password}")
    private String password;

    @Bean
    public RestClient restClient() throws Exception {
        // SSLContext 생성 (인증서 없으면 Noop로 테스트 가능)
        SSLContext sslContext = SSLContextBuilder.create()
                //.loadTrustMaterial(Paths.get("classpath:elasticsearch.crt").toFile(), null)
                .build();

        // 인증 정보
        final BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(username, password));

        RestClientBuilder builder = RestClient.builder(new HttpHost(host, port, "https"))
                .setHttpClientConfigCallback(httpClientBuilder -> httpClientBuilder
                        .setSSLContext(sslContext)
                        .setSSLHostnameVerifier((s, sslSession) -> true) // 테스트용
                        .setDefaultCredentialsProvider(credentialsProvider)
                );

        return builder.build();
    }


    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        return new ElasticsearchClient(
                new RestClientTransport(restClient, new JacksonJsonpMapper())
        );
    }

}

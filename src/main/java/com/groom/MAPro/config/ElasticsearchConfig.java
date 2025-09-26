package com.groom.MAPro.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.Header;
import org.apache.http.HttpHost;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.message.BasicHeader;
import org.apache.http.ssl.SSLContextBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLContext;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

@Configuration
public class ElasticsearchConfig {
    @Value("${elasticsearch.host}")  // application.yml에 설정
    private String host;

    @Value("${elasticsearch.port}")
    private int port;

    @Value("${elasticsearch.username}")
    private String username;

    @Value("${elasticsearch.password}")
    private String password;

    @Value("${elasticsearch.cert-path}")  // PEM or CRT 파일 경로
    private String certPath;

    @Value("${elasticsearch.apiKey:}")  // API Key가 필요할 경우
    private String apiKey;

    @Bean
    public ElasticsearchClient elasticsearchClient() throws Exception {
        HttpHost httpHost = new HttpHost(host, port, "https");

        // 인증 헤더 배열
        Header[] defaultHeaders = new Header[] {
                new BasicHeader("Authorization", "Basic " +
                        java.util.Base64.getEncoder()
                                .encodeToString((username + ":" + password).getBytes()))
        };
        if (apiKey != null && !apiKey.isBlank()) {
            // API Key 방식이면 기본 헤더 추가 (Bearer 또는 해당 포맷)
            defaultHeaders = new Header[] {
                    new BasicHeader("Authorization", apiKey)
            };
        }

        // SSLContext 구성
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        Certificate trustedCa;
        try (InputStream is = Files.newInputStream(Paths.get(certPath))) {
            trustedCa = cf.generateCertificate(is);
        }
        KeyStore trustStore = KeyStore.getInstance("pkcs12");
        trustStore.load(null, null);
        trustStore.setCertificateEntry("ca-cert", trustedCa);

        SSLContext sslContext = SSLContextBuilder.create()
                .loadTrustMaterial(trustStore, null)
                .build();

        RestClientBuilder builder = RestClient.builder(httpHost)
                .setDefaultHeaders(defaultHeaders)
                .setRequestConfigCallback(req -> req
                        .setConnectTimeout(30000)
                        .setSocketTimeout(300000))
                .setHttpClientConfigCallback(http -> http
                        .setSSLContext(sslContext)
                        .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE));

        RestClient restClient = builder.build();
        RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        return new ElasticsearchClient(transport);
    }
}

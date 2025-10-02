package com.groom.MAPro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.groom.MAPro.repository.jpa")
@EnableElasticsearchRepositories(basePackages = "com.groom.MAPro.repository.elasticsearch")
public class MaProApplication {

	public static void main(String[] args) {
		SpringApplication.run(MaProApplication.class, args);
	}

}

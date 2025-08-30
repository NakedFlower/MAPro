package com.groom.MAPro.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Helloworld {

    public String helloworld() {
        return "hello world!";
    }
}

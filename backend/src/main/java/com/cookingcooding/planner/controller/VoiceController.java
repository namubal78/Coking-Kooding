package com.cookingcooding.planner.controller;

import com.cookingcooding.planner.dto.VoiceParseRequest;
import com.cookingcooding.planner.dto.VoiceParseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planner")
public class VoiceController {

    @PostMapping("/voice")
    public ResponseEntity<VoiceParseResponse> parseVoice(@RequestBody VoiceParseRequest req) {
        return ResponseEntity.status(503).build();
    }
}

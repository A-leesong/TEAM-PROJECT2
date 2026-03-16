package com.egag.canvas;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canvas")
@RequiredArgsConstructor
public class CanvasController {

    private final CanvasService canvasService;

    @GetMapping("/{id}")
    public ResponseEntity<CanvasSessionResponse> getSession(@PathVariable String id) {
        return ResponseEntity.ok(canvasService.getSession(id));
    }

    // TODO: start, stroke, topic, colorize, save, complete
}

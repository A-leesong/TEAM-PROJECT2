package com.egag.canvas;

import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.UserRepository;
import com.egag.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CanvasService {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final StrokeAgent strokeAgent;
    private final ThemeAgent themeAgent;
    private final ColorAgent colorAgent;

    public CanvasSessionResponse getSession(String id) {
        return artworkRepository.findById(id)
                .map(CanvasSessionResponse::from)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CANVAS_NOT_FOUND", "캔버스 세션을 찾을 수 없습니다"));
    }

    // TODO: startSession, processStroke, suggestTopics, confirmTopic, colorize, save, complete
}

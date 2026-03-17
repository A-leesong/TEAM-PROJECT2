package com.egag.canvas;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class StrokeAgent {

    public StrokeResult getNextStroke(String topic, List<String> drawnParts) {
        TopicGuide.PartGuide first = TopicGuide.getFirstStroke(topic);
        return new StrokeResult(first.name(), first.points(), first.comment(), false);
    }

    public record StrokeResult(String part, List<Double> points, String comment, boolean done) {}
}

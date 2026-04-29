package com.cookingcooding.messenger.dto;

import java.util.List;
import java.util.Map;

public record MessengerHistoryResponse(
        List<MessageResponse> messages,
        Map<String, Long> reads  // email → lastReadId
) {}

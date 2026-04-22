package com.cookingcooding.devlog.dto;

import java.util.List;

public record DevLogWebhookRequest(
        String commitMessage,
        String author,
        String sha,
        List<String> changedFiles,
        String timestamp
) {}

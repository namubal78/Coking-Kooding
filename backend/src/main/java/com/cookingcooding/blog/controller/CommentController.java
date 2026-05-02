package com.cookingcooding.blog.controller;

import com.cookingcooding.blog.dto.CommentPasswordRequest;
import com.cookingcooding.blog.dto.CommentRequest;
import com.cookingcooding.blog.dto.CommentResponse;
import com.cookingcooding.blog.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/api/blog/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @PostMapping("/api/blog/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest req) {
        return ResponseEntity.ok(commentService.create(postId, req));
    }

    @PutMapping("/api/blog/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest req) {
        return ResponseEntity.ok(commentService.update(commentId, req));
    }

    @DeleteMapping("/api/blog/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestBody(required = false) CommentPasswordRequest req) {
        commentService.delete(commentId, req != null ? req.getPassword() : null);
        return ResponseEntity.noContent().build();
    }
}

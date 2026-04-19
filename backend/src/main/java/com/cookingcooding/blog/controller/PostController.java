package com.cookingcooding.blog.controller;

import com.cookingcooding.blog.dto.PostRequest;
import com.cookingcooding.blog.dto.PostResponse;
import com.cookingcooding.blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getAll(
            @RequestParam(required = false) String category) {
        List<PostResponse> posts = category != null
                ? postService.getByCategory(category)
                : postService.getAll();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getOne(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest req) {
        return ResponseEntity.ok(postService.create(req));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody PostRequest req) {
        return ResponseEntity.ok(postService.update(id, req));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

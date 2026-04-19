package com.cookingkooding.blog.service;

import com.cookingkooding.auth.entity.User;
import com.cookingkooding.auth.repository.UserRepository;
import com.cookingkooding.blog.dto.PostRequest;
import com.cookingkooding.blog.dto.PostResponse;
import com.cookingkooding.blog.entity.Post;
import com.cookingkooding.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<PostResponse> getAll() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(PostResponse::new).toList();
    }

    public List<PostResponse> getByCategory(String category) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream().map(PostResponse::new).toList();
    }

    public PostResponse getOne(Long id) {
        return new PostResponse(findById(id));
    }

    public PostResponse create(PostRequest req) {
        User author = getCurrentUser();
        Post post = Post.builder()
                .title(req.getTitle())
                .category(req.getCategory())
                .content(req.getContent())
                .excerpt(req.getExcerpt())
                .tags(req.getTags())
                .author(author)
                .build();
        return new PostResponse(postRepository.save(post));
    }

    public PostResponse update(Long id, PostRequest req) {
        Post post = findById(id);
        post.setTitle(req.getTitle());
        post.setCategory(req.getCategory());
        post.setContent(req.getContent());
        post.setExcerpt(req.getExcerpt());
        post.setTags(req.getTags());
        return new PostResponse(postRepository.save(post));
    }

    public void delete(Long id) {
        postRepository.delete(findById(id));
    }

    private Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
